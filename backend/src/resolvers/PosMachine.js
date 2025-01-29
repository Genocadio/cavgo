const PosMachine = require('../models/PosMachine'); // Import the POS model
const Car = require('../models/Car');              // Import the Car model
const User = require('../models/User');            // Import the User model
const { isNullableType } = require('graphql');
const jwt = require('jsonwebtoken'); 
const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();


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
        pubsub.publish('POS_COMMAND', {
          posCommand: "location".concat(posMachine.id), // This command can be of varying types as per your logic
        });
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
        const existingPosMachine = await PosMachine.findOne({ linkedCar: car._id }).populate('linkedCar').populate('user');
        if (existingPosMachine) {
          existingPosMachine.serialNumber = serialNumber
          await existingPosMachine.save();
          const isValid = await existingPosMachine.comparePassword(password);
          if (!isValid) {
            return {
              success: false,
              message: 'Invalid password for the registered POS machine',
              data: null,
            };
          }

          const {accessToken, refreshToken} = await existingPosMachine.generateToken();
          return {
            success: true,
            message: 'POS machine already registered for this car',
            data: existingPosMachine,
            token: accessToken,
            refreshToken: refreshToken, // No refresh token for new registration
          };
        }
    
        
       
    
        const newPosMachine = new PosMachine({
          serialNumber,
          status: 'active', // Default status to active
          linkedCar: car._id,
          user: user.id, // Use the user from context
          password, // Save hashed password
          assignedDate: new Date(), // Default assigned date to now
        });
    
        await newPosMachine.save();
        const { accessToken, refreshToken } = newPosMachine.generateToken();
    
        // Populate linked fields before returning
        const populatedPosMachine = await PosMachine.findById(newPosMachine.id)
          .populate('linkedCar')
          .populate('user');
    
        return {
          success: true,
          message: 'POS machine registered successfully',
          data: populatedPosMachine,
          token: accessToken,
          refreshToken,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error registering POS machine: ${error.message}`,
          data: null,
        };
      }
    },


    regeneratePosToken: async (_, { refreshToken }) => {
      try {
        // Step 1: Verify the refresh token (decode it)
        const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Step 2: Find the POS machine by ID from the decoded token
        const posMachine = await PosMachine.findById(decodedToken.id).populate('linkedCar');
        
        if (!posMachine) {
          return {
            success: false,
            message: 'POS machine not found for the provided refresh token',
            data: null,
          };
        }
    
        // Step 3: Generate new access token and refresh token
        const newTokens = posMachine.generateToken(); // Returns both accessToken and refreshToken
    
        // Step 4: Return both tokens in the response
        return {
          success: true,
          message: 'Tokens regenerated successfully',
          data: null, // You can populate this with any data you'd like to return
          token : newTokens.accessToken,
          refreshToken: newTokens.refreshToken
        };
      } catch (error) {
        return {
          success: false,
          message: `Error regenerating tokens: ${error.message}`,
          data: null,
        };
      }
    },

    updatePOsLocation: async(_, {latitude, longitude}, context) => {
      try {
        const { pos } = context
        if (!pos) {
          return {
            success: false,
            message: 'Unauthorized access',
            data: null,
          };
        }
        const posMachine = await PosMachine.findById(pos.id);
        if (!posMachine) {
          return {
            success: false,
            message: 'POS Machine not found',
            data: null,
          };
        }
        posMachine.latitude = latitude;
        posMachine.longitude = longitude;
        await posMachine.save();
        return {
          success: true,
          message: 'POS Machine location updated successfully',
          data: posMachine,
        };
      } catch (error) {
        return {
          success: false,
          message: `Error updating POS Machine location: ${error.message}`,
          data: null,
        };
      }
    },
    
      

    // Update an existing POS Machine
    updatePosMachine: async (
        _,
        { id, status, plateNumber,  }, // Only serialNumber, status, and plateNumber are received
        context
      ) => {
        try {
          // Ensure user is authenticated
          const { user } = context;
          const  { superUser } = context;
          const { pos} = context;
          if (!user && !superUser && !pos) {
            return {
              success: false,
              message: 'Unauthorized access',
              data: null,
            };
          }
          if(user && user.userType !== 'admin') {
            return {
              success: false,
              message: 'Unauthorized access',
              data: null,
            };
          }
      
          // Find the POS machine by serial number (since serial number won't change)
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
          let car = null;
          // Find the car by plate number to link to the POS machine
          if (plateNumber!= null && plateNumber) {
            car = await Car.findOne({ plateNumber });
            if (!car) {
              return {
                success: false,
                message: 'Car not found',
                data: null,
              };
            }
            posMachine.linkedCar = car._id;
          }
        
          // Update the POS machine with new status and linked car
          if(status != null && status){
            posMachine.status = status;
          }
          if(user != null && user) {
            posMachine.user = user.id;
          }
                // Set the user from context
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

      commandPosMachine: async (_, {id, command}, context) => {
        try {
          const { superUser}  = context
          if (!superUser) {
            return {
              success: false,
              message: 'Unauthorized access',
              data: null,
            };

          }
          const posMachine = await PosMachine.findById(id);
          if (!posMachine) {
            return {
              success: false,
              message: 'POS Machine not found',
              data: null,
            };
          }
          pubsub.publish('POS_COMMAND', {
            posCommand: {
              command: command.concat(posMachine.id), // Ensure this is a string value
            }
          });
          return {
            success: true,
            message: 'POS machine command sent successfully',
            data: null,
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

  Subscription: {
    posCommand: {
      subscribe: withFilter(() => pubsub.asyncIterator(['POS_COMMAND']),
      (payload, variables) => {
        const { id } = variables;
        return payload.posCommand.command.includes(id);
      }),
    }
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
