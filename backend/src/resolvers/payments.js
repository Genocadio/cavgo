const Payment = require('../models/Payment'); // Import the Payment model
const Booking = require('../models/Booking'); // Import the Booking model
const Car = require('../models/Car'); // Import the Car model
const User = require('../models/User'); // Import the User model
const Trip = require('../models/Trip'); // Import the Trip model
const paymentResolvers = {
  Query: {
    async getPayment(_, { id }, context) {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        const payment = await Payment.findById(id)
          .populate('booking')
          .populate('car');

        if (!payment) {
          return { success: false, message: 'Payment not found', data: null };
        }

        return { success: true, message: 'Payment retrieved successfully', data: payment };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },

    async getPaymentsByUser(_, __, context) {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized', data: null };
        }

        const payments = await Payment.find({ userId: user.id }) // Use user.id here
          .populate('booking')
          .populate('car');

        return { success: true, message: 'Payments retrieved successfully', data: payments };
      } catch (error) {
        return { success: false, message: error.message, data: null };
      }
    },
  },

  Mutation: {
    async createPayment(_, { bookingId, phoneNumber }, context) {
        try {
          const { user } = context; // Get the user from context
      
          // Ensure the user is authenticated
          if (!user) {
            return { success: false, message: 'Unauthorized' };
          }
      
          // Fetch the booking details using the bookingId
          const booking = await Booking.findById(bookingId);
          const trip = await Trip.findById(booking.trip);
          console.log('trip', trip)
          const car = await Car.findById(trip.car);
          console.log('car & user', car, user)


      
          // Ensure the booking exists
          if (!booking) {
            return { success: false, message: 'Booking not found' };
          }
      
          // Get the amount to be paid from the booking
          const amountPaid = booking.price; // Assuming `totalPrice` is the field for the booking amount
      
          // Create a new payment record
          const newPayment = new Payment({
            booking: bookingId,
            amountPaid, // Set the amount fetched from booking
            phoneNumber, // Store the phone number in the payment record
            userId: user.id, // Use user.id from the context for payment
            car: car._id
          });
      
          // Save the payment to the database
          await newPayment.save();
      
          // Return success response
          return { success: true, message: 'Payment created successfully', data: newPayment };
        } catch (error) {
          // Handle errors
          return { success: false, message: error.message, data: null };
        }
      },
      
  },

  Payment: {
    booking: async (payment) => {
      try {
        if (payment.booking) {
          return await Booking.findById(payment.booking); // Fetch the associated booking
        }
        return null;
      } catch (err) {
        console.error('Error fetching booking:', err);
        return null;
      }
    },
    car: async (payment) => {
      try {
        if (payment.car) {
          return await Car.findById(payment.car); // Fetch the associated car
        }
        return null;
      } catch (err) {
        console.error('Error fetching car:', err);
        return null;
      }
    },
    user: async (payment) => {
      try {
        if (payment.userId) {
          return await User.findById(payment.userId); // Fetch the associated user
        }
        return null;
      } catch (err) {
        console.error('Error fetching user:', err);
        return null;
      }
    },
  },
};

module.exports = paymentResolvers;
