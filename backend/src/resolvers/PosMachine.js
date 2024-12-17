const PosMachine = require('../models/PosMachine'); // Import the POS model
const Car = require('../models/Car');              // Import the Car model
const User = require('../models/User');            // Import the User model
const { isNullableType } = require('graphql');


const posResolvers = {
  Query: {
    // Fetch all POS Machines
    getPosMachines: async () => {
      try {
        const posMachines = await PosMachine.find()
          .populate('linkedCar')
          .populate('user');
        return {
          success: true,
          message: 'POS machines fetched successfully',
          data: posMachines,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error fetching POS machines: ${error.message}`,
          data: [],
        };
      }
    },

    // Fetch a single POS Machine by ID
    getPosMachine: async (_, { id }) => {
      try {
        const posMachine = await PosMachine.findById(id)
          .populate('linkedCar')
          .populate('user');
        if (!posMachine) {
          return {
            success: false,
            message: 'POS Machine not found',
            data: null,
          };
        }
        return {
          success: true,
          message: 'POS machine fetched successfully',
          data: posMachine,
          
        };
      } catch (error) {
        return {
          success: false,
          message: `Error fetching POS machine: ${error.message}`,
          data: null,
        };
      }
    },
  },

  Mutation: {
    // Create a new POS Machine
    registerPosMachine: async (_, { serialNumber, carPlate, password }, context) => {
      try {
        const { user } = context;
    
        // Ensure user is authenticated
        if (!user) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null,
          };
        }
    
        // Validate user existence
        const existingUser = await User.findById(user.id);
        if (!existingUser) {
          return {
            success: false,
            message: 'User not found',
            data: null,
          };
        }
    
        // Validate car existence by plate number
        const car = await Car.findOne({ plateNumber: carPlate });
        if (!car) {
          return {
            success: false,
            message: 'Car with the provided plate number not found',
            data: null,
          };
        }
    
        // Check if a POS machine is already registered for this car
        const existingPosMachine = await PosMachine.findOne({ linkedCar: car._id });
        if (existingPosMachine) {
          return {
            success: false,
            message: 'POS machine already registered for this car',
            data: null,
          };
        }
    
        
        const token = PosMachine.generateToken();
    
        const newPosMachine = new PosMachine({
          serialNumber,
          status: 'active', // Default status to active
          linkedCar: car._id,
          user: user.id, // Use the user from context
          password, // Save hashed password
          assignedDate: new Date(), // Default assigned date to now
        });
    
        await newPosMachine.save();
    
        // Populate linked fields before returning
        const populatedPosMachine = await PosMachine.findById(newPosMachine.id)
          .populate('linkedCar')
          .populate('user');
    
        return {
          success: true,
          message: 'POS machine registered successfully',
          data: populatedPosMachine,
          token,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error registering POS machine: ${error.message}`,
          data: null,
        };
      }
    },


    regeneratePosToken: async (_, { plateNumber, password, serialNumber }) => {
      try {
        // Step 1: Find the POS machine by serial number and populate the linked car
        const posMachine = await PosMachine.findOne({ serialNumber }).populate('linkedCar');
        
        if (!posMachine) {
          return {
            success: false,
            message: 'POS machine with the provided serial number not found',
            data: null,
          };
        }
  
        // Step 2: Validate that the plate number matches the linked car's plate number
        if (posMachine.linkedCar.plateNumber !== plateNumber) {
          return {
            success: false,
            message: 'The provided plate number does not match the linked car for this POS machine',
            data: null,
          };
        }
  
        // Step 3: Compare the provided password with the stored hashed password
        const isPasswordValid = await posMachine.comparePassword(password);
        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid password',
            data: null,
          };
        }
  
        // Step 4: Generate a new token for the POS machine
        const newToken = posMachine.generateToken();
  
        return {
          success: true,
          message: 'New token generated successfully',
          data: isNullableType,
          token: newToken,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error generating new token: ${error.message}`,
          data: null,
        };
      }
    },

    // Update an existing POS Machine
    updatePosMachine: async (
        _,
        { serialNumber, status, plateNumber }, // Only serialNumber, status, and plateNumber are received
        { user } // Accessing user from context
      ) => {
        try {
          // Ensure user is authenticated
          if (!user) {
            return {
              success: false,
              message: 'User not authenticated',
              data: null,
            };
          }
      
          // Find the POS machine by serial number (since serial number won't change)
          const posMachine = await PosMachine.findOne({ serialNumber })
            .populate('linkedCar')
            .populate('user');
      
          if (!posMachine) {
            return {
              success: false,
              message: 'POS Machine not found',
              data: null,
            };
          }
      
          // Find the car by plate number to link to the POS machine
          const car = await Car.findOne({ plateNumber });
          if (!car) {
            return {
              success: false,
              message: 'Car not found',
              data: null,
            };
          }
      
          // Update the POS machine with new status and linked car
          posMachine.status = status;
          posMachine.linkedCar = car._id;  // Update the linked car to the new car found by plate number
          posMachine.user = user._id;      // Set the user from context
          posMachine.assignedDate = new Date(); // Set the assigned date automatically
          posMachine.lastActivityDate = new Date(); // Set the last activity date automatically
      
          // Save the updated POS machine
          await posMachine.save();
      
          // Return the updated POS machine
          return {
            success: true,
            message: 'POS machine updated successfully',
            data: posMachine,
          };
        } catch (error) {
          return {
            success: false,
            message: `Error updating POS machine: ${error.message}`,
            data: null,
          };
        }
      },
      

    // Delete a POS Machine
    deletePosMachine: async (_, { id }) => {
      try {
        const posMachine = await PosMachine.findByIdAndDelete(id);
        if (!posMachine) {
          return {
            success: false,
            message: 'POS Machine not found',
            data: null,
          };
        }

        return {
          success: true,
          message: 'POS machine deleted successfully',
          data: posMachine,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error deleting POS machine: ${error.message}`,
          data: null,
        };
      }
    },
  },
  PosMachine: {
    user: async (posMachine) => {
        if (posMachine.user) {
            return
            await User.findById(posMachine.user);
        }
        return null;
        },
    linkedCar: async (posMachine) => {
        if (posMachine.linkedCar) {
            return
            await Car.findById(posMachine.linkedCar);
        }
        return null;
    },
  }
};

module.exports = posResolvers;
