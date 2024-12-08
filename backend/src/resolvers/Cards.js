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

        // Check if a user with the provided email or phone exists
        let existingUser = await User.findOne({
          $or: [{ email }, { phoneNumber: phone }],
        });
        console.log(existingUser);
        // If no user exists, create a new user with default password
        if (!existingUser) {
          const newUser = new User({
            firstName,
            lastName,
            email,
            phoneNumber: phone,
            password: 'test1223', // Default password
            userType: 'customer', // Default user type
          });

          existingUser = await newUser.save();
        }

        // Create a new card and assign the user's ID to it
        const card = new Card({
          nfcId,
          user: existingUser.id,
          creator: user.id, // Assign the current user as the creator
        });
        console.log('Created card:', card);

        await card.save();
        console.log('Card saved:', card);
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
