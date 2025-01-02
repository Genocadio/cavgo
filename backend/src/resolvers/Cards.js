const Card = require('../models/Card');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

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
    getCard: async (_, { nfcId }, context) => {
      try {
        const { user } = context;
        const { pos} = context

        // Ensure the user is authenticated
        if (!user && !pos) {
          return { success: false, message: 'Unauthorized' };
        }

        const card = await Card.findOne({ nfcId: nfcId }).populate('user').populate('creator');
        if (!card) {
          return { success: false, message: 'Card not found' };
        }

        // Admins can view all cards; other users can only view their own cards
        if (user && user.userType !== 'admin' && user.id !== card.creator.id) {
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
        const { agent } = context;
    
        // Ensure the user is authenticated
        if (!user && !agent) {
          return { success: false, message: 'Unauthorized' };
        }
    
        // Only admins can create new cards
        if (!agent && user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }
    
        let userId = null;
        let card = null;
    
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

        if (agent) {
          card = await Card.findOne({ nfcId: nfcId });
          
          if (card) {
             if (card.user && card.active) {
              return { success: false, message: 'Card already registered' };
             }
            card.agent = agent.id;
            card.user = userId;
            card.active = true;
            await card.save();
            return { success: true, message: 'Card registered successfully', data: card };
          } else {
            return { success: false, message: 'Card not Valid' };
          }

         
        } 
    
        // Create a new card with the user's ID (if available)
        card = new Card({
          nfcId,
          user: userId, // Assign the user ID or null if no user
          creator: user.id, // Assign the current user as the creator
        });


    
        // Save the card to the database
        await card.save();
        if (card.user !== null && card.wallet !== null) {
          
          return { success: true, message: 'Card created successfully with wallet', data: card };
        }
      
    
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
      if (!parent.user) return null; // If user is null, return null instead of querying the database
      return await User.findById(parent.user);
    },
    creator: async (parent) => {
      if (!parent.creator) return null; // If creator is null, return null
      return await User.findById(parent.creator);
    },
    wallet: async (parent) => {
      if (!parent.wallet) return null; // If no wallet, return nul
      return await Wallet.findById(parent.wallet)
    },
  }
  
};



module.exports = cardResolvers;
