const SuperUser = require('../models/superUser');


const superUserResolvers = {
  Mutation: {
    registerSuperUser: async (_, { firstName, lastName, email, phoneNumber, password }) => {
      try {
        // Check if the email already exists
        const existingUser = await SuperUser.findOne({ email });
        if (existingUser) {
          return { success: false, message: 'Email already in use' };
        }

        // Create a new super user instance
        const superUserData = { firstName, lastName, email, phoneNumber, password };
        console.log("Super user :", superUserData)
        const superUser = new SuperUser(superUserData);

        // Save the new super user to the database
        await superUser.save();
        console.log("New super user")

        // Generate a token for the super user
        const { accessToken, refreshToken } = superUser.generateToken();

        return { success: true, token: accessToken, superUser };
      } catch (err) {
        console.error('Error registering super user:', err);
        return { success: false, message: err.message || 'Error registering super user' };
      }
    },

    loginSuperUser: async (_, { email, password }) => {
      try {
        // Find the super user by email
        const superUser = await SuperUser.findOne({ email });
        if (!superUser) return { success: false, message: 'Super user not found' };

        // Compare the provided password with the stored hashed password
        const isMatch = await superUser.comparePassword(password);
        if (!isMatch) return { success: false, message: 'Invalid credentials' };

        // Generate a token for the super user
        const { accessToken, refreshToken } = superUser.generateToken();

        return { success: true, token: accessToken, superUser };
      } catch (err) {
        console.error('Login failed:', err);
        return { success: false, message: err.message || 'Login failed' };
      }
    },

    updateSuperUser: async (_, { id, firstName, lastName, email, phoneNumber }, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };

        // Only allow admins or the super user themselves to update their own profile
        if (user.userType !== 'admin' && user._id.toString() !== id) {
          return { success: false, message: 'Access denied' };
        }

        const updatedData = { firstName, lastName, email, phoneNumber };
        const superUser = await SuperUser.findByIdAndUpdate(id, updatedData, { new: true });
        if (!superUser) return { success: false, message: 'Super user not found' };

        return { success: true, data: superUser };
      } catch (err) {
        console.error('Error updating super user:', err);
        return { success: false, message: err.message || 'Error updating super user' };
      }
    },

    deleteSuperUser: async (_, { id }) => {
      try {
        const superUser = await SuperUser.findByIdAndDelete(id);
        if (!superUser) return { success: false, message: 'Super user not found' };

        return { success: true, data: superUser };
      } catch (err) {
        console.error('Error deleting super user:', err);
        return { success: false, message: err.message || 'Error deleting super user' };
      }
    },
  },

  Query: {
    getSuperUser: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user) return { success: false, message: 'Unauthorized' };

        // Only allow admins to view any super user profile
        if (user.userType !== 'admin') {
          return { success: false, message: 'Access denied' };
        }

        const superUser = await SuperUser.findById(id);
        if (!superUser) return { success: false, message: 'Super user not found' };

        return { success: true, data: superUser };
      } catch (err) {
        console.error('Error fetching super user:', err);
        return { success: false, message: err.message || 'Error fetching super user' };
      }
    },

    getSuperUsers: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context
        if (!user || user.userType !== 'admin') {
          return { success: false, message: 'Unauthorized' };
        }

        const superUsers = await SuperUser.find();
        return { success: true, data: superUsers };
      } catch (err) {
        console.error('Error fetching super users:', err);
        return { success: false, message: err.message || 'Error fetching super users' };
      }
    },
  },

  SuperUser: {
    // You can add any custom resolvers for fields here, such as fetching related data
  },
};

module.exports = superUserResolvers;
