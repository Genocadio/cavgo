const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { startPaymentCheckTimer } = require('../helpers/payment');
const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const Card = require('../models/Card');
const Wallet = require('../models/Wallet')
const PosMachine = require('../models/PosMachine');
const Agent = require('../models/Agents');

const bookingResolvers = {
  Query: {
    getBooking: async (_, { id }, context) => {
      try {
        // Check if the user is logged in (user ID should be available in the context)
        const user = context.user;
        const pos = context.pos;
        if (!user && !pos) {
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
            .populate('trip')
            .populate('tickets');

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
            .populate('tickets')
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

    getBookings: async (_, { tripId }, context) => {
      try {
        // Optional: Check if user is authenticated, but we can still return all bookings
        // console.log('context', context);
        // if (!context.user && !context.pos) {
        //   return {
        //     success: false,
        //     message: 'Unauthorized access',
        //     data: null
        //   };
        // }

        // Define the query object
        const query = tripId ? { trip: tripId } : {};

        // Fetch bookings with optional tripId filter
        const bookings = await Booking.find(query).populate('trip');

        return {
          success: true,
          message: tripId
            ? `Bookings for trip ${tripId} fetched successfully`
            : 'All bookings fetched successfully',
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
        console.log('context', context);
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

    addAgentBooking: async (_, { tripId, destination, numberOfTickets, price, clientName }, context) => {
      console.log('tripId', tripId, 'destination', destination, 'numberOfTickets', numberOfTickets, 'price', price);
      try {
        const { agent } = context
        if (!agent) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null
          };
        } else {
          if(!destination) {
            return {
              success: false,
              message: 'Destination is required',
              data: null
            };
          }
          if (price > agent.wallet.balance) {
            return { success: false, message: 'Insufficient balance for agent' };
          }
          console.log('agent e:', agent);
          const trip = await Trip.findById(tripId);
          if (!trip) {
            console.log('Trip not found:', tripId); // Log when trip is not found
            return {
              success: false,
              message: 'Trip not found',
              data: null
            };
          }
          if(!clientName){
            return {
              success: false,
              message: 'Client name is required',
              data: null
            };
          }

          tempagent = await Agent.findById(agent.id);
          console.log('agent temp:', tempagent);
          tempagent.wallet.balance -= price;

          await tempagent.save();
          agentbalace = tempagent.wallet.balance;
          console.log('agent temp bal****:', agentbalace);

          const booking = new Booking({
            trip: trip._id,
            destination: destination,
            status: 'Waiting Board',
            numberOfTickets,
            price,
            agent: agent.id,
            clientName
          });
          let savedBooking = null;
          try {
            savedBooking = await booking.save();
          } catch (err) {
            tempagent.wallet.balance += price
            await tempagent.save();
            console.error('Error saving agentbooking:', err); // Log error
            return {
              success: false,
              message: err.message || 'Error saving agentbooking',
              data: null
            };
          }
          console.log('savedBooking:', savedBooking);
          return {
            success: true,
            message: 'Agent booking created successfully',
            data: savedBooking,
            balance: agentbalace
          };
        }



      } catch (err) {
        console.error('Error in agentBooking:', err); // Log error
        return {
          success: false,
          message: err.message || 'Error creating agentbooking',
          data: null
        };
      }
    },
    addBooking: async (_, { tripId, destination, numberOfTickets, price, nfcId }, context) => {
      console.log('nfcId', nfcId, 'tripId', tripId, 'destination', destination, 'numberOfTickets', numberOfTickets, 'price', price);
      try {
        let userId;
        let card = null
        const { user } = context;
        const { pos } = context;

        if (!user && !pos) {
          return {
            success: false,
            message: 'User not authenticated',
            data: null
          };
        }
        if (nfcId && pos) {
          // If NFC ID is provided, get the user associated with the card
          card = await Card.findOne({ nfcId });
          if (!card) {
            console.log('Card not found with NFC ID:', nfcId); // Log when NFC card is not found
            return {
              success: false,
              message: 'Card not found',
              data: null
            };
          }
          // The user associated with the NFC card is the owner
          userId = card.user;
        } else {
          // If NFC ID is not provided, use the user from context

          if (!user) {
            console.log('User not found in context'); // Log when user is not authorized
            return {
              success: false,
              message: 'Unauthorized',
              data: null
            };
          }
          userId = user.id;
          card = user.defaultCard || null
          if (card) {
            newCard = await Card.findById(card)
            nfcId = newCard.nfcId
            card = newCard
          }
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
          user: userId, // Use the user ID obtained from context or NFC card
          trip: trip._id,
          destination,
          numberOfTickets,
          card: nfcId ? card._id : null,
          pos: pos ? pos.id : null,
          price
        });

        await booking.save();
        let paycard = null
        if (nfcId) {
          paycard = card._id

        }
        if (user && !nfcId) {
          paycard = user.defaultCard
        }
        const wallet = paycard ? await Wallet.findOne({ card: paycard }) : null;

        const Transaction = {
          type: "debit",
          amount: price,
          description: "Payment for booking by default card",
        }

        if (Transaction.type === 'debit' && wallet.balance >= Transaction.amount && wallet !== null) {
          wallet.balance += Transaction.type === 'debit' ? -Transaction.amount : Transaction.amount

          wallet.transactions.push(Transaction)
          await wallet.save()
          booking.status = 'Waiting Board'
          await booking.save()
          pubsub.publish('BOOKING_ADDED', { bookingAdded: booking });
          return {
            success: true,
            message: 'booking created successfully',
            data: booking
          };

        }


        startPaymentCheckTimer(booking._id);

        console.log('Booking created successfully:', booking); // Log successful booking creation
        pubsub.publish('BOOKING_ADDED', { bookingAdded: booking });
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

        pubsub.publish('BOOKING_UPDATED', { bookingUpdated: booking });

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

  Subscription: {
    bookingAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['BOOKING_ADDED']),
        (payload, variables) => {
          const { tripId } = variables;
          console.log('Payload:', payload);
          const tripIdFromPayload = payload.bookingAdded.trip.toString(); // Convert ObjectId to string
          console.log('Trip ID from payload:', tripIdFromPayload, 'variable:', variables);
          // Check if the booking's tripId matches the provided tripId
          return tripId === tripIdFromPayload;
        }
      ),
    },
    bookingUpdated: {
      subscribe: () => pubsub.asyncIterator(['BOOKING_UPDATED'])
    }
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
    },
    ticket: async (booking) => {
      try {
        if (booking.ticket) {
          return await Ticket.findById(booking.ticket);
        }
        return null;
      } catch (err) {
        console.error('Error in Booking ticket resolver:', err); // Log error
        return null;
      }
    },
    pos: async function (booking) {
      try {
        if (booking.pos) {
          return await PosMachine.findById(booking.pos).populate('linkedCar');
        }
        return null;
      } catch (err) {
        console.error('Error in Booking pos resolver:', err); // Log error
        return null;
      }
    },
    card: async (booking) => {
      try {
        if (booking.card) {
          return await Card.findById(booking.card);
        }
        return null;
      } catch (err) {
        console.error('Error in Booking card resolver:', err); // Log error
        return null;
      }
    },
  }
};

module.exports = bookingResolvers;
