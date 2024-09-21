const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');

const userResolvers = {
  Query: {
    // Get all users (admin only)
    getUsers: async (_, __, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Admin users can fetch all users
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const users = await User.find().populate('company'); // Populate company if exists
        return { success: true, data: users };
      } catch (err) {
        console.error('Error fetching users:', err);
        return { success: false, message: err.message || 'Error fetching users' };
      }
    },

    // Get a single user by ID
    getUser: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Users can only fetch their own details
        if (user.id !== id && user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const userDetails = await User.findById(id).populate('company'); // Populate company if exists
        if (!userDetails) return { success: false, message: 'User not found' };
        return { success: true, data: userDetails };
      } catch (err) {
        console.error('Error fetching user:', err);
        return { success: false, message: err.message || 'Error fetching user' };
      }
    },
  },

  Mutation: {
    // Register a new user
    registerUser: async (_, { firstName, lastName, email, phoneNumber, password }) => {
      try {
        const user = new User({
          firstName,
          lastName,
          email,
          phoneNumber,
          password
        });

        await user.save();
        const token = user.generateToken();
        return { success: true, data: { user, token } };
      } catch (err) {
        console.error('Error registering user:', err);
        return { success: false, message: err.message || 'Error registering user' };
      }
    },

    // Login an existing user
    loginUser: async (_, { email, password }) => {
      try {
        const user = await User.findOne({ email }).populate('company'); // Populate company if exists
        if (!user) return { success: false, message: 'User not found' };

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return { success: false, message: 'Invalid credentials' };

        const token = user.generateToken();
        return { success: true, data: { user, token } };
      } catch (err) {
        console.error('Login failed:', err);
        return { success: false, message: err.message || 'Login failed' };
      }
    },

    // Update an existing user
    updateUser: async (_, { id, firstName, lastName, email, phoneNumber, userType, companyId }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // If an ID is passed, the signed-in user must be an admin to update other users
        if (id) {
          if (user.userType !== 'admin') {
            return { success: false, message: 'Permission denied' };
          }

          const userToUpdate = await User.findById(id);
          if (!userToUpdate) return { success: false, message: 'User not found' };

          // Update user fields
          if (firstName) userToUpdate.firstName = firstName;
          if (lastName) userToUpdate.lastName = lastName;
          if (email) userToUpdate.email = email;
          if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
          if (userType) {
            userToUpdate.userType = userType;
            if (userType === 'company' && companyId) {
              userToUpdate.company = mongoose.Types.ObjectId(companyId);
            } else if (userType !== 'company') {
              userToUpdate.company = null;
            }
          }

          await userToUpdate.save();
          return { success: true, data: userToUpdate };
        } else {
          // If no ID is passed, the signed-in user is updating their own profile
          const userToUpdate = await User.findById(user.id);
          if (!userToUpdate) return { success: false, message: 'User not found' };

          // Users cannot update their own userType
          if (firstName) userToUpdate.firstName = firstName;
          if (lastName) userToUpdate.lastName = lastName;
          if (email) userToUpdate.email = email;
          if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;

          await userToUpdate.save();
          return { success: true, data: userToUpdate };
        }
      } catch (err) {
        console.error('Error updating user:', err);
        return { success: false, message: err.message || 'Error updating user' };
      }
    },

    // Delete a user (admin only)
    deleteUser: async (_, { id }, context) => {
      try {
        const { user } = context; // Get the user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        // Only admin can delete users
        if (user.userType !== 'admin') {
          return { success: false, message: 'Permission denied' };
        }

        const userToDelete = await User.findByIdAndDelete(id);
        if (!userToDelete) return { success: false, message: 'User not found' };
        return { success: true, data: userToDelete };
      } catch (err) {
        console.error('Error deleting user:', err);
        return { success: false, message: err.message || 'Error deleting user' };
      }
    }
  }
};

module.exports = userResolvers;
