const Agent = require('../models/Agents');

const agentResolvers = {
  Mutation: {
    registerAgent: async (_, { firstName, lastName, email, phoneNumber, password }) => {
      try {
        const agentData = { firstName, lastName, email, phoneNumber, password };
        const agent = new Agent(agentData);
        await agent.save();

        const token = agent.generateToken();
        return { success: true, token, agent };
      } catch (err) {
        console.error('Error registering agent:', err);
        return { success: false, message: err.message || 'Error registering agent' };
      }
    },

    loginAgent: async (_, { email, password }) => {
      try {
        const agent = await Agent.findOne({ email });
        if (!agent) return { success: false, message: 'Agent not found' };

        const isMatch = await agent.comparePassword(password);
        if (!isMatch) return { success: false, message: 'Invalid credentials' };

        const { accessToken, refreshToken } = agent.generateToken();
        return { success: true, token: accessToken, agent, refreshToken };
      } catch (err) {
        console.error('Login failed:', err);
        return { success: false, message: err.message || 'Login failed' };
      }
    },

     regenerateAgentToken: async (_, { refreshToken }) => {
          try {
            // Step 1: Verify the refresh token (decode it)
            const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            
            // Step 2: Find the POS machine by ID from the decoded token
            const agent = await Agent.findById(decodedToken.id).populate('linkedCar');
            
            if (!agent) {
              return {
                success: false,
                message: 'POS machine not found for the provided refresh token',
                data: null,
              };
            }
        
            // Step 3: Generate new access token and refresh token
            const newTokens = agent.generateToken(); // Returns both accessToken and refreshToken
        
            // Step 4: Return both tokens in the response
            return {
              success: true,
              message: 'Tokens regenerated successfully',
              data: null, // You can populate this with any data you'd like to return
              token : newTokens.accessToken,
              refreshToken: newTokens.refreshToken
            };
          } catch (error) {
            return {
              success: false,
              message: `Error regenerating tokens: ${error.message}`,
              data: null,
            };
          }
        },

    updateAgent: async (_, { id, firstName, lastName, email, phoneNumber }, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };

        // Ensure agents can only update their own profile unless the user is an admin
        if (user.userType !== 'admin' && user._id.toString() !== id) {
          return { success: false, message: 'Access denied' };
        }

        const updatedData = { firstName, lastName, email, phoneNumber };
        const agent = await Agent.findByIdAndUpdate(id, updatedData, { new: true });
        if (!agent) return { success: false, message: 'Agent not found' };

        return { success: true, data: agent };
      } catch (err) {
        console.error('Error updating agent:', err);
        return { success: false, message: err.message || 'Error updating agent' };
      }
    },

    deleteAgent: async (_, { id }) => {
      try {
        const agent = await Agent.findByIdAndDelete(id);
        if (!agent) return { success: false, message: 'Agent not found' };

        return { success: true, data: agent };
      } catch (err) {
        console.error('Error deleting agent:', err);
        return { success: false, message: err.message || 'Error deleting agent' };
      }
    },

    addTransaction: async (_, { id, type, amount, description }, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };

        const agent = await Agent.findById(id);
        if (!agent) return { success: false, message: 'Agent not found' };

        const transaction = { type, amount, description };
        agent.wallet.transactions.push(transaction);

        // Update wallet balance
        if (type === 'credit') {
          agent.wallet.balance += amount;
        } else if (type === 'debit') {
          if (agent.wallet.balance < amount) {
            return { success: false, message: 'Insufficient balance' };
          }
          agent.wallet.balance -= amount;
        }

        await agent.save();
        return { success: true, data: agent.wallet };
      } catch (err) {
        console.error('Error adding transaction:', err);
        return { success: false, message: err.message || 'Error adding transaction' };
      }
    },
  },

  Query: {
    getAgent: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context
        // if (!user) return { success: false, message: 'Unauthorized' };

        // // Allow agents to view their own profile or admins to view any profile
        // if (user.userType !== 'admin' && user._id.toString() !== id) {
        //   return { success: false, message: 'Access denied' };
        // }
        const {agent} = context
        if (!agent && !user) return { success: false, message: 'Unauthorized' };
        if(user && user.userType !== 'admin') {
            return { success: false, message: 'Access denied' };
        }
        let Id = id
        if(agent) {
            Id = agent.id
        } 
        const agentt = await Agent.findById(Id);
        console.log("\n\n\n\n\n\n****get agent ######\n\n\n", agent);

        if (!agentt) return { success: false, message: 'Agent not found' };

        return { success: true, data: agentt };
      } catch (err) {
        console.error('Error fetching agent:', err);
        return { success: false, message: err.message || 'Error fetching agent' };
      }
    },

    getAgents: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user || user.userType !== 'admin') {
          return { success: false, message: 'Unauthorized' };
        }

        const agents = await Agent.find();
        return { success: true, data: agents };
      } catch (err) {
        console.error('Error fetching agents:', err);
        return { success: false, message: err.message || 'Error fetching agents' };
      }
    },

    getAgentWallet: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };

        // Allow agents to view their own wallet or admins to view any wallet
        if (user.userType !== 'admin' && user._id.toString() !== id) {
          return { success: false, message: 'Access denied' };
        }

        const agent = await Agent.findById(id);
        if (!agent) return { success: false, message: 'Agent not found' };

        return { success: true, data: agent.wallet };
      } catch (err) {
        console.error('Error fetching wallet:', err);
        return { success: false, message: err.message || 'Error fetching wallet' };
      }
    },
  },

  Agent: {
    transactions: async (agent) => agent.wallet.transactions,
  },
};

module.exports = agentResolvers;
