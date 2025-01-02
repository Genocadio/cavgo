const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Card = require('../models/Card');
const Agent = require('../models/Agents');

const walletResolvers = {
  Query: {
    // Get all wallets (admin only)
    getWallets: async (_, __, context) => {
      try {
        const { user } = context;

        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const wallets = await Wallet.find().populate('user');
        return { success: true, data: wallets };
      } catch (err) {
        console.error('Error fetching wallets:', err);
        return { success: false, message: err.message || 'Error fetching wallets' };
      }
    },

    // Get a single wallet by its ID
    getWallet: async (_, { id }, context) => {
      try {
        const { user } = context;

        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        const wallet = await Wallet.findById(id).populate('user');
        if (!wallet) {
          return { success: false, message: 'Wallet not found' };
        }

        if (user.userType !== 'admin' && wallet.user.toString() !== user.id) {
          return { success: false, message: 'Permission denied' };
        }

        return { success: true, data: wallet };
      } catch (err) {
        console.error('Error fetching wallet:', err);
        return { success: false, message: err.message || 'Error fetching wallet' };
      }
    },
  },

  Mutation: {
    // Create a new wallet
    createWallet: async (_, { userId, nfcId }, context) => {
        try {
          const { user } = context;
      
          // Check if the user is authenticated
          if (!user) {
            return { success: false, message: 'Unauthorized' };
          }
      
          // Check if the user has admin permissions
          if (user.userType !== 'admin') {
            return { success: false, message: 'Permission denied' };
          }
      
          let linkedUser = null;
          let cardId = null;
      
          // Prefer cardId to userId for linking the wallet
          if (nfcId) {
            console.log('nfcId:', nfcId);
            const card = await Card.findOne({ nfcId }).populate('user'); // Find the card and populate its user
            if (!card) {
              return { success: false, message: 'Card not found' };
            }
            if (!card.user) {
              return { success: false, message: 'Card is not linked to a user' };
            }
      
            // Check if the card already has a wallet
            const existingWallet = await Wallet.findOne({ card: card._id });
            if (existingWallet) {
              return {
                success: false,
                message: 'A wallet is already linked to this card',
              };
            }
      
            linkedUser = card.user._id; // Use the user linked to the card
            cardId = card._id;
          } else if (userId) {
            linkedUser = userId; // Fall back to provided userId
          } else {
            return { success: false, message: 'Either cardId or userId must be provided' };
          }
      
          // Create a new wallet
          const wallet = new Wallet({
            user: linkedUser,
            card: cardId,
            balance: 0, // Default balance
          });
          
      
          // Save the wallet to the database
          await wallet.save();
      
          return {
            success: true,
            message: 'Wallet created successfully',
            data: wallet,
          };
        } catch (err) {
          console.error('Error creating wallet:', err);
          return {
            success: false,
            message: err.message || 'Error creating wallet',
          };
        }
      },
      

    // Update an existing wallet
    updateWallet: async (_, { nfcId, transaction }, context) => {
        try {
          const { user } = context;
          const {agent } = context
          let agentbalace = null;
          let tempagent = null;
      
          // Check if the user is authenticated
          if (!user && !agent) {
            return { success: false, message: 'Unauthorized' };
          }
      
          // Check if the user has admin permissions
          if (user && user.userType !== 'admin') {
            return { success: false, message: 'Permission denied' };
          }
      
          // Find the card by ID

          const card = await Card.findOne({ nfcId }).populate('user');
          if (!card) {
            return { success: false, message: 'Card not found' };
          }
      
          // Find the wallet associated with the card's user
          const wallet = await Wallet.findOne({ card: card._id });
          if (!wallet) {
            return { success: false, message: 'Wallet not found for the given card' };
          }
      
          // Validate transaction type and adjust balance
          const { type, amount, description } = transaction;
          if (type !== 'credit' && type !== 'debit') {
            return { success: false, message: "Transaction type must be 'credit' or 'debit'" };
          }
      
          if (type === 'debit' && wallet.balance < amount) {
            return { success: false, message: 'Insufficient balance for debit transaction'};
          } 

          if (agent) {
            if (amount > agent.wallet.balance) {
              return { success: false, message: 'Insufficient balance for agent' };
            }
            console.log('agent:', agent);
            
            tempagent = await Agent.findById(agent.id);
            console.log('agent temp:', tempagent);
            tempagent.wallet.balance -= amount;
            
            await tempagent.save();
            agentbalace = tempagent.wallet.balance;
            console.log('agent temp bal****:', agentbalace);
            wallet.balance += type === 'credit' ? amount : -amount;
      
            // Add transaction to the wallet
            wallet.transactions.push({
              type,
              amount,
              description,
              date: new Date(),
            });

            await wallet.save();
            
            return {
              success: true,
              message: 'Wallet updated successfully by agent',
              data: wallet,
              agentbalance: agentbalace
            };
          }
      
          // Update balance
          wallet.balance += type === 'credit' ? amount : -amount;
      
          // Add transaction to the wallet
          wallet.transactions.push({
            type,
            amount,
            description,
            date: new Date(),
          });
      
          // Save the updated wallet
          await wallet.save();
      
          return {
            success: true,
            message: 'Wallet updated successfully',
            data: wallet,
          };
        } catch (err) {
          console.error('Error updating wallet:', err);
          return {
            success: false,
            message: err.message || 'Error updating wallet',
          };
        }
      },
      
    // Delete a wallet
    deleteWallet: async (_, { id }, context) => {
      try {
        const { user } = context;

        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const wallet = await Wallet.findByIdAndDelete(id);
        if (!wallet) {
          return { success: false, message: 'Wallet not found' };
        }

        return { success: true, message: 'Wallet deleted successfully' };
      } catch (err) {
        console.error('Error deleting wallet:', err);
        return { success: false, message: err.message || 'Error deleting wallet' };
      }
    },
  },

  Wallet: {
    user: async (parent) => {
      return await User.findById(parent.user);
    },
    card: async (parent) => {
      return await Card.findById(parent.card);
    },
  },
};

module.exports = walletResolvers;
