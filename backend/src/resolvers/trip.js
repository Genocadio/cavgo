// const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Route = require('../models/Route');
const Car = require('../models/Car');
const Driver = require('../models/Driver');
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
    },
    getTripsByDriver: async (_, { driverId }, context) => {
      try {
        const { user } = context;
    
        // Ensure either a driverId is provided or the user is authenticated
        if (!driverId && !user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null,
          };
        }
    
        const id = driverId || user.id;
    
        // Check permission if driverId is provided and user is not admin
        if (driverId && driverId !== user.id && user.userType !== 'admin') {
          return {
            success: false,
            message: 'Permission denied',
            data: null,
          };
        }
    
        // Fetch the driver
        const driver = await Driver.findById(id);
        if (!driver) {
          return {
            success: false,
            message: 'Driver not found',
            data: null,
          };
        }
    
        // Fetch cars for the driver
        const cars = await Car.find({ driver: driver._id }).select('_id'); // Only fetch IDs
        if (!cars.length) {
          return {
            success: true,
            message: 'No trips found for this driver',
            data: [],
          };
        }
    
        // Fetch trips for the driver's cars
        const trips = await Trip.find({ car: { $in: cars.map(car => car._id) } })
          .populate('route')
          .populate('car')
          .populate('user');
    
        return {
          success: true,
          message: 'Trips fetched successfully',
          data: trips,
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || 'Error fetching trips',
          data: null,
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

    updateTrip: async (_, { id, routeId, carId, boardingTime, status, availableSeats, stopPoints, reverseRoute }) => {
      try {
        const trip = await Trip.findById(id);

        if (!trip) {
          return {
            success: false,
            message: "Trip not found",
          };
        }

        // Update the fields if provided
        if (routeId) trip.routeId = routeId;
        if (carId) trip.carId = carId;
        if (boardingTime) trip.boardingTime = boardingTime;
        if (status) trip.status = status;
        if (availableSeats !== undefined) trip.availableSeats = availableSeats; // allow updating to 0
        if (stopPoints) trip.stopPoints = stopPoints; // Update stop points
        if (reverseRoute !== undefined) trip.reverseRoute = reverseRoute; // allow setting to false

        const updatedTrip = await trip.save();

        return {
          success: true,
          message: "Trip updated successfully",
          data: updatedTrip,
        };
      } catch (error) {
        return {
          success: false,
          message: "Error updating trip: " + error.message,
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
    },
    stopPoints: async (trip) => {
      // Populate stopPoints with their corresponding Location data
      const populatedStopPoints = await Promise.all(trip.stopPoints.map(async (point) => {
        const location = await Location.findById(point.location);
        return {
          ...point,
          location // Add the full location object to the point
        };
      }));
      return populatedStopPoints;
    }
  }
};

module.exports = tripResolvers;
