const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const User = require('../models/User');
const { startPaymentCheckTimer} = require('../helpers/payment');


const bookingResolvers = {
  Query: {
    getBooking: async (_, { id }, context) => {
      try {
        // Check if the user is logged in (user ID should be available in the context)
        const user = context.user;
        if (!user) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null
          };
        }
    
        let booking;
    
        // If an id is provided, fetch the specific booking
        if (id) {
          booking = await Booking.findById(id)
            .populate('user')
            .populate('trip');
    
          if (!booking) {
            return {
              success: false,
              message: 'Booking not found',
              data: null
            };
          }
    
          // If the booking is found but doesn't belong to the logged-in user
          if (booking.user._id.toString() !== user.id) {
            return {
              success: false,
              message: 'You are not authorized to view this booking',
              data: null
            };
          }
    
        } else {
          // If no id is provided, fetch all bookings for the logged-in user
          booking = await Booking.find({ user: user.id })
            .populate('user')
            .populate('trip')
            .sort({ createdAt: -1 }); // Optional: Sort by creation date, newest first
    
          if (!booking || booking.length === 0) {
            return {
              success: false,
              message: 'No bookings found for the logged-in user',
              data: null
            };
          }
        }
    
        return {
          success: true,
          message: 'Booking(s) fetched successfully',
          data: booking
        };
      } catch (err) {
        console.error('Error in getBooking:', err); // Log error
        return {
          success: false,
          message: err.message || 'Error fetching booking',
          data: null
        };
      }
    },
    
    getBookings: async (_, __, context) => {
        try {
          // Optional: Check if user is authenticated, but we can still return all bookings
          if (!context.user) {
            console.warn('User not authenticated, still returning all bookings.');
          }
      
          // Fetch all bookings
          const bookings = await Booking.find().populate('trip');
      
          return {
            success: true,
            message: 'All bookings fetched successfully',
            data: bookings
          };
        } catch (err) {
          console.error('Error in getBookings:', err); // Log error
          return {
            success: false,
            message: err.message || 'Error fetching bookings',
            data: null
          };
        }
    },

    getBookingsByUser: async (_, { userId }, context) => {
        try {
          // Check if user is authenticated
          if (!context.user) {
            return {
              success: false,
              message: 'Unauthorized access',
              data: null
            };
          }
      
          // Determine which user to fetch bookings for
          const queryUserId = userId || context.user.id; // Use provided userId or logged-in user's ID
      
          // Fetch bookings based on userId
          const bookings = await Booking.find({ user: queryUserId })
            .populate('trip');
      
          return {
            success: true,
            message: 'Bookings fetched successfully',
            data: bookings
          };
        } catch (err) {
          console.error('Error in getBookingsByUser:', err); // Log error
          return {
            success: false,
            message: err.message || 'Error fetching bookings',
            data: null
          };
        }
      }
      
      
  },

  Mutation: {
    addBooking: async (_, { tripId, destination, numberOfTickets, price }, context) => {
        try {
          const { user } = context;
      
          if (!user) {
            console.log('User not found in context'); // Log when user is not authorized
            return {
              success: false,
              message: 'Unauthorized',
              data: null
            };
          }
      
          console.log('Finding trip with ID:', tripId);
          const trip = await Trip.findById(tripId);
          if (!trip) {
            console.log('Trip not found:', tripId); // Log when trip is not found
            return {
              success: false,
              message: 'Trip not found',
              data: null
            };
          }
      
          const booking = new Booking({
            user: user.id,
            trip: trip._id,
            destination,
            numberOfTickets,
            price
          });
      
          await booking.save();
          startPaymentCheckTimer(booking._id);
      
          console.log('Booking created successfully:', booking); // Log successful booking creation
          return {
            success: true,
            message: 'Booking created successfully',
            data: booking
          };
        } catch (err) {
          console.error('Error in addBooking:', err); // Log error
          return {
            success: false,
            message: err.message || 'Error creating booking',
            data: null
          };
        }
      },
      
    deleteBooking: async (_, { id }, context) => {
      try {
        const { user } = context;

        if (!user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null
          };
        }

        const booking = await Booking.findById(id);

        if (!booking) {
          return {
            success: false,
            message: 'Booking not found',
            data: null
          };
        }

        if (!booking.user.equals(user.id)) {
          return {
            success: false,
            message: 'Permission denied',
            data: null
          };
        }

        await booking.deleteOne();

        return {
          success: true,
          message: 'Booking deleted successfully',
          data: null
        };
      } catch (err) {
        console.error('Error in deleteBooking:', err); // Log error
        return {
          success: false,
          message: err.message || 'Error deleting booking',
          data: null
        };
      }
    },
    updateBookingStatus: async (_, { id, status }, context) => {
      try {
        const { user } = context;

        // Check if the user is authenticated
        if (!user) {
          return {
            success: false,
            message: 'Unauthorized',
            data: null,
          };
        }

        // Find the booking by ID
        const booking = await Booking.findById(id);

        // Check if the booking exists
        if (!booking) {
          return {
            success: false,
            message: 'Booking not found',
            data: null,
          };
        }

        // Check if the booking belongs to the authenticated user
        if (!booking.user.equals(user.id)) {
          return {
            success: false,
            message: 'Permission denied',
            data: null,
          };
        }

        // Update the booking status
        booking.status = status;

        // Save the updated booking
        await booking.save();

        return {
          success: true,
          message: 'Booking status updated successfully',
          data: booking,
        };
      } catch (err) {
        console.error('Error in updateBookingStatus:', err);
        return {
          success: false,
          message: err.message || 'Error updating booking status',
          data: null,
        };
      }
    },
  },

  Booking: {
    user: async (booking) => {
      try {
        if (booking.user) {
          return await User.findById(booking.user);
        }
        return null;
      } catch (err) {
        console.error('Error in Booking user resolver:', err); // Log error
        return null;
      }
    },
    trip: async (booking) => {
      try {
        if (booking.trip) {
          return await Trip.findById(booking.trip);
        }
        return null;
      } catch (err) {
        console.error('Error in Booking trip resolver:', err); // Log error
        return null;
      }
    }
  }
};

module.exports = bookingResolvers;