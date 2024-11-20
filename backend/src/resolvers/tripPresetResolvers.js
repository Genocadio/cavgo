const TripPreset = require('../models/TripPreset'); // Import TripPreset model
const Route = require('../models/Route');
const Location = require('../models/Location');
const Company = require('../models/Company');
const User = require('../models/User');

const tripPresetResolvers = {
  Query: {
    // Get a single TripPreset by ID
    getTripPreset: async (_, { id }) => {
      try {
        const preset = await TripPreset.findById(id)
          .populate('route')
          .populate('stopPoints.location')
          .populate('user')
          .populate('company');

        if (!preset) {
          return {
            success: false,
            message: 'Trip preset not found',
            data: null,
          };
        }

        return {
          success: true,
          message: 'Trip preset fetched successfully',
          data: preset,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Error fetching trip preset',
          data: null,
        };
      }
    },

    // Get all TripPresets
    getTripPresets: async (_, __, context) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null,
          };
        }

        const presets = await TripPreset.find({ company: user.company })
          .populate('route')
          .populate('stopPoints.location')
          .populate('user')
          .populate('company');

        return {
          success: true,
          message: 'Trip presets fetched successfully',
          data: presets,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Error fetching trip presets',
          data: null,
        };
      }
    },
  },

  Mutation: {
    // Add a new TripPreset
    addTripPreset: async (_, { routeId, stopPoints, reverseRoute, presetName }, context) => {
        try {
          const { user } = context;
      
          // Ensure the user is authenticated
          if (!user || (user.userType !== 'company' && user.userType !== 'admin')) {
            return {
              success: false,
              message: 'Unauthorized',
              data: null,
            };
          }
      
          // Verify the route exists
          const route = await Route.findById(routeId);
          if (!route) {
            return {
              success: false,
              message: 'Route not found',
              data: null,
            };
          }
      
          // Verify and map stopPoints
          const mappedStopPoints = await Promise.all(
            stopPoints.map(async (point) => {
              const location = await Location.findById(point.location);
              if (!location) {
                throw new Error(`Location with ID ${point.location} not found`);
              }
              return {
                location,
                price: point.price,
              };
            })
          );
      
          // Check if a preset with the same route, stopPoints, and reverseRoute already exists for the same company
          const existingPreset = await TripPreset.findOne({
            route: routeId,
            reverseRoute,
            company: user.company || null,
            stopPoints: mappedStopPoints
          });
      
          if (existingPreset) {
            return {
              success: false,
              message: `Failed to create preset: A preset with the same data already exists for this company.`,
              data: null,
            };
          }
      
          // Create and save the preset
          const preset = new TripPreset({
            route: routeId,
            stopPoints: mappedStopPoints,
            reverseRoute,
            presetName,
            user: user.id,
            company: user.company || null,
          });
      
          await preset.save();
      
          return {
            success: true,
            message: 'Trip preset created successfully',
            data: preset,
          };
        } catch (error) {
          return {
            success: false,
            message: error.message || 'Error creating trip preset',
            data: null,
          };
        }
      },

    // Update an existing TripPreset
    updateTripPreset: async (
      _,
      { id, routeId, stopPoints, reverseRoute, presetName },
      context
    ) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user || user.userType !== 'company') {
          return {
            success: false,
            message: 'Unauthorized',
            data: null,
          };
        }

        const preset = await TripPreset.findById(id);

        if (!preset) {
          return {
            success: false,
            message: 'Trip preset not found',
            data: null,
          };
        }

        // Update fields if provided
        if (routeId) preset.route = routeId;
        if (stopPoints) {
          preset.stopPoints = await Promise.all(
            stopPoints.map(async (point) => {
              const location = await Location.findById(point.location);
              if (!location) {
                throw new Error(`Location with ID ${point.location} not found`);
              }
              return {
                location,
                price: point.price,
              };
            })
          );
        }
        if (reverseRoute !== undefined) preset.reverseRoute = reverseRoute;
        if (presetName) preset.presetName = presetName;

        const updatedPreset = await preset.save();
        return {
          success: true,
          message: 'Trip preset updated successfully',
          data: updatedPreset,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Error updating trip preset',
          data: null,
        };
      }
    },

    // Delete a TripPreset
    deleteTripPreset: async (_, { id }, context) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user || user.userType !== 'company') {
          return {
            success: false,
            message: 'Unauthorized',
            data: null,
          };
        }

        const preset = await TripPreset.findById(id);

        if (!preset) {
          return {
            success: false,
            message: 'Trip preset not found',
            data: null,
          };
        }

        await preset.deleteOne();
        return {
          success: true,
          message: 'Trip preset deleted successfully',
          data: null,
        };
      } catch (error) {
        return {
          success: false,
          message: error.message || 'Error deleting trip preset',
          data: null,
        };
      }
    },
  },

  TripPreset: {
    route: async (preset) => {
      if (preset.route) {
        return await Route.findById(preset.route);
      }
      return null;
    },
    stopPoints: async (preset) => {
      const populatedStopPoints = await Promise.all(
        preset.stopPoints.map(async (point) => {
          const location = await Location.findById(point.location);
          return {
            ...point,
            location,
          };
        })
      );
      return populatedStopPoints;
    },
    user: async (preset) => {
      if (preset.user) {
        return await User.findById(preset.user);
      }
      return null;
    },
    company: async (preset) => {
      if (preset.company) {
        return await Company.findById(preset.company);
      }
      return null;
    },
  },
};

module.exports = tripPresetResolvers;
