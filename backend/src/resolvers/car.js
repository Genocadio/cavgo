const mongoose = require('mongoose');
const Car = require('../models/Car');
const Company = require('../models/Company');
const Driver = require('../models/Driver');
const User = require('../models/User'); // Import the User model

const carResolvers = {
  Query: {
    getCar: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Fetch the car by ID
        const car = await Car.findById(id).populate('user'); // Populate user field

        if (!car) {
          return { success: false, message: 'Car not found' };
        }

        // If the user is a company user, check if the car belongs to their company
        if (user.userType === 'company') {
          if (car.ownerCompany.toString() !== user.companyId.toString()) {
            return { success: false, message: 'Permission denied' };
          }
        }

        return { success: true, data: car };
      } catch (err) {
        console.error('Error fetching car:', err);
        return { success: false, message: err.message || 'Error fetching car' };
      }
    },

    getCars: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        let cars;

        if (user.userType === 'admin') {
          // Admins can fetch all cars
          cars = await Car.find().populate('user'); // Populate user field
        } else if (user.userType === 'company') {
          // Company users can only fetch cars belonging to their company
          cars = await Car.find({ ownerCompany: user.company }).populate('user'); // Populate user field
        } else {
          return { success: false, message: 'Permission denied' };
        }

        return { success: true, data: cars };
      } catch (err) {
        console.error('Error fetching cars:', err);
        return { success: false, message: err.message || 'Error fetching cars' };
      }
    },
  },

  Mutation: {
    registerCar: async (_, { plateNumber, numberOfSeats, ownerCompanyId, privateOwner, driverId, isOccupied, userId }, context) => {
      try {
        const { user } = context; // Get the user from context

        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Check if the user is an admin or a company
        if (user.userType === 'admin') {
          // Admin can register cars with either ownerCompany or privateOwner
          if (ownerCompanyId) {
            // Check if the provided company ID is valid
            const ownerCompany = await Company.findById(ownerCompanyId);
            if (!ownerCompany) return { success: false, message: 'Owner company not found' };
          } else if (!privateOwner) {
            return { success: false, message: 'Either ownerCompany or privateOwner must be provided' };
          }
        } else if (user.userType === 'company') {
          // Company can only register cars with the ownerCompany set to their own company
          ownerCompanyId = user.company
        } else {
          return { success: false, message: 'Unauthorized user type' };
        }

        const carData = {
          plateNumber,
          numberOfSeats,
          isOccupied,
          user: new mongoose.Types.ObjectId(userId) // Set the user who added the car
        };

        if (ownerCompanyId) {
          carData.ownerCompany = new mongoose.Types.ObjectId(ownerCompanyId);
        } else if (privateOwner) {
          carData.privateOwner = privateOwner;
        }

        if (driverId) {
          carData.driver = new mongoose.Types.ObjectId(driverId);
        }

        const car = new Car(carData);
        await car.save();
        return { success: true, data: car };
      } catch (err) {
        console.error('Error registering car:', err);
        return { success: false, message: err.message || 'Error registering car' };
      }
    },
    updateCar: async (
      _,
      { id, plateNumber, numberOfSeats, ownerCompanyId, privateOwner, driverId, isOccupied },
      context
    ) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };
    
        // If the user is not an admin, ensure they can only update cars they own
        if (user.userType !== 'admin' && user.userType !== 'company') {
          // If the logged-in user's company doesn't match the car's company, deny access
          const car = await Car.findById(id);
          if (!car) return { success: false, message: 'Car not found' };
          if (!user.company.equals(car.ownerCompany)) {
            return { success: false, message: 'Permission denied' };
          }
        } else {
          // If the user is an admin, allow updating any car
          if (!id) {
            return { success: false, message: 'Car ID is required' };
          }
        }
    
        // Prepare the updated data object
        const updatedData = { plateNumber, numberOfSeats, privateOwner, isOccupied };
        
        // If an ownerCompanyId is provided, update the reference
        if (ownerCompanyId) {
          updatedData.ownerCompany = mongoose.Types.ObjectId(ownerCompanyId);
        }
    
        // Handle the driverId logic separately to avoid circular dependencies
        if (driverId) {
          const driver = await Driver.findById(driverId);
          if (!driver) {
            return { success: false, message: 'Driver not found' };
          }
    
          // Check if the driver is already assigned to another car
          const existingCarWithDriver = await Car.findOne({ driver: driverId });
          if (existingCarWithDriver && existingCarWithDriver.id !== id) {
            // Remove the driver from the other car
            await Car.findByIdAndUpdate(existingCarWithDriver.id, { driver: null });
    
            // Optionally, update the driver's car field (if needed)
            await Driver.findByIdAndUpdate(driverId, { car: null });
          }
    
          // Update the car's driver field
          updatedData.driver = driverId;
          // Update the driver's car field to the new car
          await Driver.findByIdAndUpdate(driverId, { car: id });
        }
    
        // Update the car in the database
        const car = await Car.findByIdAndUpdate(id, updatedData, { new: true });
        if (!car) return { success: false, message: 'Car not found' };
    
        return { success: true, data: car };
      } catch (err) {
        console.error('Error updating car:', err);
        return { success: false, message: err.message || 'Error updating car' };
      }
    },
    
    

    deleteCar: async (_, { id }) => {
      try {
        const car = await Car.findByIdAndDelete(id);
        if (!car) return { success: false, message: 'Car not found' };
        return { success: true, data: car };
      } catch (err) {
        console.error('Error deleting car:', err);
        return { success: false, message: err.message || 'Error deleting car' };
      }
    },
  },

  Car: {
    ownerCompany: async (car) => {
      try {
        if (car.ownerCompany) {
          return await Company.findById(car.ownerCompany);
        }
        return null;
      } catch (err) {
        console.error('Error fetching owner company:', err);
        return null;
      }
    },
    driver: async (car) => {
      try {
        if (car.driver) {
          return await Driver.findById(car.driver);
        }
        return null;
      } catch (err) {
        console.error('Error fetching driver:', err);
        return null;
      }
    },
    user: async (car) => {
      try {
        if (car.user) {
          return await User.findById(car.user);
        }
        return null;
      } catch (err) {
        console.error('Error fetching user:', err);
        return null;
      }
    },
  },
};

module.exports = carResolvers;
