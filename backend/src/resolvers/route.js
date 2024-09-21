const mongoose = require('mongoose');
const Route = require('../models/Route');
const Location = require('../models/Location');
const User = require('../models/User'); // Import the User model

const routeResolvers = {
  Query: {
    getRoute: async (_, { id }, context) => {
      try {
        const route = await Route.findById(id)
          .populate('origin')
          .populate('destination');

        if (!route) {
          return { success: false, message: 'Route not found', data: null };
        }

        return {
          success: true,
          message: 'Route fetched successfully',
          data: route,
        };
      } catch (err) {
        console.error('Error fetching route:', err);
        return { success: false, message: err.message || 'Error fetching route', data: null };
      }
    },
    getRoutes: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context
        console.log("in routes\n\n\n")

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized', data: [] };
        }

        const routes = await Route.find()
          .populate('origin')
          .populate('destination');
          const filteredRoutes = routes.filter(route => route.origin && route.destination);
        console.log('r fetched\n\n\n\n', routes )
        return {
          success: true,
          message: 'Routes fetched successfully',
          data: filteredRoutes,
        };
      } catch (err) {
        console.error('Error fetching routes:', err);
        return { success: false, message: err.message || 'Error fetching routes', data: [] };
      }
    },
  },

  Mutation: {
    addRoute: async (_, { originId, destinationId, googleMapsRouteId, price }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated and authorized
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied', data: null };
        }

        // Validate origin and destination locations
        const origin = await Location.findById(originId);
        const destination = await Location.findById(destinationId);

        if (!origin || !destination) {
          return { success: false, message: 'Origin or Destination location not found', data: null };
        }

        // Create and save the route
        const route = new Route({
          origin: origin._id,
          destination: destination._id,
          googleMapsRouteId,
          price
        });

        await route.save();

        return { success: true, message: 'Route added successfully', data: route };
      } catch (err) {
        console.error('Error adding route:', err);
        return { success: false, message: err.message || 'Error adding route', data: null };
      }
    },

    deleteRoute: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated and authorized
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied', data: null };
        }

        const route = await Route.findById(id);
        if (!route) {
          return { success: false, message: 'Route not found', data: null };
        }

        await route.deleteOne();
        return { success: true, message: `Route with ID: ${id} successfully deleted`, data: null };
      } catch (err) {
        console.error('Error deleting route:', err);
        return { success: false, message: err.message || 'Error deleting route', data: null };
      }
    }
  },

  Route: {
    origin: async (route) => {
      if (route.origin) {
        return await Location.findById(route.origin);
      }
      return null;
    },
    destination: async (route) => {
      if (route.destination) {
        return await Location.findById(route.destination);
      }
      return null;
    }
  }
};

module.exports = routeResolvers;
