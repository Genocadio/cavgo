const Card = require('../models/Card');
const User = require('../models/User');

const cardResolvers = {
  Query: {
    // Get all cards (admin only)
    getCards: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Only admins can fetch all cards
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const cards = await Card.find().populate('userId').populate('creatorId');
        return { success: true, data: cards };
      } catch (err) {
        console.error('Error fetching cards:', err);
        return { success: false, message: err.message || 'Error fetching cards' };
      }
    },

    // Get a single card by its ID
    getCard: async (_, { id }, context) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        const card = await Card.findById(id).populate('userId').populate('creatorId');
        if (!card) {
          return { success: false, message: 'Card not found' };
        }

        // Admins can view all cards; other users can only view their own cards
        if (user.userType !== 'admin' && card.userId.toString() !== user.id) {
          return { success: false, message: 'Permission denied' };
        }

        return { success: true, data: card };
      } catch (err) {
        console.error('Error fetching card:', err);
        return { success: false, message: err.message || 'Error fetching card' };
      }
    },
  },

  Mutation: {
    createCard: async (_, { nfcId, email, phone, firstName, lastName }, context) => {
      try {
        const { user } = context;
    
        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }
    
        // Only admins can create new cards
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }
    
        let userId = null;
    
        // Check if email or phone is provided
        if (email || phone) {
          // Search for an existing user by email or phone
          let existingUser = await User.findOne({
            $or: [{ email }, { phoneNumber: phone }],
          });
    
          // If no user exists, create a new user with the provided details
          if (!existingUser && firstName && lastName && phone) {
            const newUser = new User({
              firstName,
              lastName,
              email: email || null, // Email can be null if not provided
              phoneNumber: phone,
              password: 'test1223', // Default password
              userType: 'customer', // Default user type
            });
    
            existingUser = await newUser.save();
          }
    
          // Assign user ID if a user is found or created
          if (existingUser) {
            userId = existingUser.id;
          }
        }
    
        // Create a new card with the user's ID (if available)
        const card = new Card({
          nfcId,
          user: userId, // Assign the user ID or null if no user
          creator: user.id, // Assign the current user as the creator
        });
    
        // Save the card to the database
        await card.save();
    
        return { success: true, message: 'Card created successfully', data: card };
      } catch (err) {
        console.error('Error creating card:', err);
        return { success: false, message: err.message || 'Error creating card' };
      }
    },
    
  

    // Update an existing card
    updateCard: async (_, { id, nfcId, userId }, context) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Only admins can update cards
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const card = await Card.findById(id);
        if (!card) {
          return { success: false, message: 'Card not found' };
        }

        if (nfcId) card.nfcId = nfcId;
        if (userId) card.user = userId;

        await card.save();
        return { success: true, data: card };
      } catch (err) {
        console.error('Error updating card:', err);
        return { success: false, message: err.message || 'Error updating card' };
      }
    },

    // Delete a card
    deleteCard: async (_, { id }, context) => {
      try {
        const { user } = context;

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Only admins can delete cards
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const card = await Card.findByIdAndDelete(id);
        if (!card) {
          return { success: false, message: 'Card not found' };
        }

        return { success: true, message: 'Card deleted successfully' };
      } catch (err) {
        console.error('Error deleting card:', err);
        return { success: false, message: err.message || 'Error deleting card' };
      }
    },
  },
   Card: { 
    user: async (parent) => {
      return await User.findById(parent.user);
    },
    creator: async (parent) => {
      return await User.findById(parent.creator);
    },
   }
};



module.exports = cardResolvers;
