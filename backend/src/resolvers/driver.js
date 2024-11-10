const mongoose = require('mongoose');
const Driver = require('../models/Driver');
const Company = require('../models/Company');
const Car = require('../models/Car');

const driverResolvers = {
  Mutation: {
    registerDriver: async (_, { name, email, phoneNumber, type, license, companyId, password }) => {
      if (type !== 'private' && !companyId) {
        return { success: false, message: 'Company ID must be provided for non-private drivers.' };
      }

      try {
        const driverData = { name, email, phoneNumber, type, license, password };
        if (type === 'company') {
          driverData.company = new mongoose.Types.ObjectId(companyId);

        }

        const driver = new Driver(driverData);
        await driver.save();
        const token = driver.generateToken();
        return { success: true, token, driver };
      } catch (err) {
        console.log('Error registering driver:', err);
        // Return specific MongoDB error message
        return { success: false, message: err.message || 'Error registering driver' };
      }
    },

    loginDriver: async (_, { email, password }) => {
      try {
        const driver = await Driver.findOne({ email });
        if (!driver) return { success: false, message: 'Driver not found' };

        const isMatch = await driver.comparePassword(password);
        if (!isMatch) return { success: false, message: 'Invalid credentials' };

        const token = driver.generateToken();
        return { success: true, token, driver };
      } catch (err) {
        console.log('Login failed:', err);
        return { success: false, message: err.message || 'Login failed' };
      }
    },

    updateDriver: async (_, { id, name, email, phoneNumber, type, license, companyId }) => {
      try {
        const updatedData = { name, email, phoneNumber, type, license };
        if (companyId) {
          updatedData.company = mongoose.Types.ObjectId(companyId);
        }

        const driver = await Driver.findByIdAndUpdate(id, updatedData, { new: true });
        if (!driver) return { success: false, message: 'Driver not found' };
        return { success: true, data: driver };
      } catch (err) {
        console.log('Error updating driver:', err);
        // Return specific MongoDB error message
        return { success: false, message: err.message || 'Error updating driver' };
      }
    },

    deleteDriver: async (_, { id }) => {
      try {
        const driver = await Driver.findByIdAndDelete(id);
        if (!driver) return { success: false, message: 'Driver not found' };
        return { success: true, data: driver };
      } catch (err) {
        console.log('Error deleting driver:', err);
        // Return specific MongoDB error message
        return { success: false, message: err.message || 'Error deleting driver' };
      }
    }
  },

  Query: {
    getDriver: async (_, { id }) => {
      try {
        const driver = await Driver.findById(id);
        if (!driver) return { success: false, message: 'Driver not found' };
        return { success: true, data: driver };
      } catch (err) {
        console.log('Error fetching driver:', err);
        // Return specific MongoDB error message
        return { success: false, message: err.message || 'Error fetching driver' };
      }
    },

    getDrivers: async () => {
      try {
        const drivers = await Driver.find();
        return { success: true, data: drivers };
      } catch (err) {
        console.log('Error fetching drivers:', err);
        // Return specific MongoDB error message
        return { success: false, message: err.message || 'Error fetching drivers' };
      }
    }
  },

  Driver: {
    company: async (driver) => {
      if (driver.company) {
        return await Company.findById(driver.company);
      }
      return null;
    },
    car: async (driver) => {
      if (driver.car) {
        return await Car.findById(driver.car);
      }
      return null;
    }

  }
};

module.exports = driverResolvers;
