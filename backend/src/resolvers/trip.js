const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Car = require('../models/Car');
const User = require('../models/User');
const Location = require('../models/Location'); // Import the Location model

const tripResolvers = {
  Query: {
    getTrip: async (_, { id }) => {
      try {
        const trip = await Trip.findById(id)
          .populate('route')
          .populate('car')
          .populate('user');

        if (!trip) {
          return {
            success: false,
            message: 'Trip not found',
            data: null
          };
        }

        return {
          success: true,
          message: 'Trip fetched successfully',
          data: trip
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Error fetching trip',
          data: null
        };
      }
    },

    getTrips: async () => {
      try {
        const trips = await Trip.find()
          .populate('route')
          .populate('car')
          .populate('user');

        return {
          success: true,
          message: 'Trips fetched successfully',
          data: trips
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Error fetching trips',
          data: null
        };
      }
    }
  },

  Mutation: {
    addTrip: async (_, { routeId, carId, boardingTime, status, stopPoints, reverseRoute }, context) => {
      try {
        const { user } = context; // Get the user from context
        console.log("adding trip");
    
        // Ensure the user is authenticated and authorized
        if (!user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null
          };
        }
    
        if (user.userType !== 'admin' && user.userType !== 'company') {
          return {
            success: false,
            message: 'Permission denied',
            data: null
          };
        }
    
        // Ensure that the route and car exist
        const route = await Route.findById(routeId);
        const car = await Car.findById(carId);
    
        if (!route || !car) {
          return {
            success: false,
            message: 'Route or Car not found',
            data: null
          };
        }
    
        // Fetch locations for the stop points
        const mappedStopPoints = await Promise.all(stopPoints.map(async (point) => {
          const location = await Location.findById(point.locationId);
          if (!location) {
            throw new Error(`Location with ID ${point.locationId} not found`);
          }
          return {
            location, // Full location object
            price: point.price // Price associated with the stop point
          };
        }));
    
        // Create the trip with the populated stop points
        const trip = new Trip({
          route: routeId,
          car: carId,
          boardingTime,
          status,
          user: user.id, // Use the ID from the context
          availableSeats: car.numberOfSeats, // Set available seats to the car's seat count
          stopPoints: mappedStopPoints, // Include the mapped stop points with full location objects
          reverseRoute
        });
    
        await trip.save();
        return {
          success: true,
          message: 'Trip created successfully',
          data: trip
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Error creating trip',
          data: null
        };
      }
    },
    

    deleteTrip: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null
          };
        }

        // Fetch the trip to check associated car
        const trip = await Trip.findById(id).populate('car');

        if (!trip) {
          return {
            success: false,
            message: 'Trip not found',
            data: null
          };
        }

        const car = trip.car; // Car from the trip

        if (user.userType === 'admin') {
          // Admin can delete any trip
          await trip.deleteOne();
          return {
            success: true,
            message: 'Trip deleted successfully',
            data: null
          };
        } else if (user.userType === 'company') {
          // Company user can delete trips with cars under their company
          const userCompany = await User.findById(user.id).populate('company');

          if (!car || !userCompany || !car.ownerCompany.equals(userCompany.company._id)) {
            return {
              success: false,
              message: 'Permission denied or car not found in your company',
              data: null
            };
          }

          await trip.deleteOne();
          return {
            success: true,
            message: 'Trip deleted successfully',
            data: null
          };
        } else {
          return {
            success: false,
            message: 'Permission denied',
            data: null
          };
        }
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Error deleting trip',
          data: null
        };
      }
    }
  },

  Trip: {
    route: async (trip) => {
      if (trip.route) {
        return await Route.findById(trip.route);
      }
      return null;
    },
    car: async (trip) => {
      if (trip.car) {
        return await Car.findById(trip.car);
      }
      return null;
    },
    user: async (trip) => {
      if (trip.user) {
        return await User.findById(trip.user);
      }
      return null;
    }
  }
};

module.exports = tripResolvers;
