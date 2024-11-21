const mongoose = require('mongoose');
const Location = require('../models/Location');

const locationResolvers = {
  Query: {
    getLocation: async (_, { id }, context) => {
      try {
        const { user } = context;

        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        if (user.userType !== 'admin' && user.userType !== 'company') {
          return { success: false, message: 'Permission denied', data: null };
        }

        const location = await Location.findById(mongoose.Types.ObjectId(id));
        if (!location) {
          return { success: false, message: 'Location not found', data: null };
        }
        return { success: true, message: 'Location fetched successfully', data: location };
      } catch (err) {
        console.error('Error fetching location:', err);
        return { success: false, message: err.message || 'Error fetching location', data: null };
      }
    },

    getLocations: async (_, { type }, context) => {
      try {
        const { user } = context;

        if (!user) {
          return { success: false, message: 'Unauthorized', data: [] };
        }

        if (user.userType !== 'admin' && user.userType !== 'company') {
          return { success: false, message: 'Permission denied', data: [] };
        }

        const query = type ? { type } : {};
        const locations = await Location.find(query);
        return { success: true, message: 'Locations fetched successfully', data: locations };
      } catch (err) {
        console.error('Error fetching locations:', err);
        return { success: false, message: err.message || 'Error fetching locations', data: [] };
      }
    },
  },

  Mutation: {
    addLocation: async (_, { name, type, coordinates, address, googlePlaceId }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated and authorized
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        if (user.userType !== 'admin' && user.userType !== 'company') {
          return { success: false, message: 'Permission denied', data: null };
        }

        const location = new Location({
          name,
          type,
          coordinates: { lat: coordinates.lat, lng: coordinates.lng },
          address,
          googlePlaceId
        });

        await location.save();
        return { success: true, message: 'Location added successfully', data: location };
      } catch (err) {
        console.error('Error adding location:', err);
        return { success: false, message: err.message || 'Error adding location', data: null };
      }
    },

    updateLocation: async (_, { id, name, type, coordinates, address, googlePlaceId }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated and authorized
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied', data: null };
        }

        const location = await Location.findByIdAndUpdate(
          mongoose.Types.ObjectId(id),
          { name, type, coordinates: { lat: coordinates.lat, lng: coordinates.lng }, address, googlePlaceId },
          { new: true }
        );
        if (!location) {
          return { success: false, message: 'Location not found', data: null };
        }
        return { success: true, message: 'Location updated successfully', data: location };
      } catch (err) {
        console.error('Error updating location:', err);
        return { success: false, message: err.message || 'Error updating location', data: null };
      }
    },

    deleteLocation: async (_, { id }, context) => {
      try {
        console.log('delete called', id)
        const { user } = context; // Get the user from context
    
        // Ensure the user is authenticated and authorized
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }
    
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied', data: null };
        }
    
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return { success: false, message: 'Invalid ID format', data: null };
        }
    
        const locationId = (id);
    
        const location = await Location.findByIdAndDelete(locationId);
        if (!location) {
          return { success: false, message: 'Location not found', data: null };
        }
    
        return { success: true, message: 'Location deleted successfully', data: location };
      } catch (err) {
        console.error('Error deleting location:', err);
        return { success: false, message: err.message || 'Error deleting location', data: null };
      }
    }
  }
};

module.exports = locationResolvers;
