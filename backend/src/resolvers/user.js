const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Driver = require('../models/Driver');

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
    
        // If no id is provided, return the logged-in user's details
        if (!id) {
          const userDetails = await User.findById(user.id).populate('company'); // Populate company if exists
          if (!userDetails) return { success: false, message: 'User not found' };
          return { success: true, data: userDetails };
        }
    
        // If an id is provided, check if the user is an admin
        if (user.userType !== 'admin' && user.id !== id) {
          return { success: false, message: 'Permission denied' };
        }
    
        // Fetch the user details based on the provided id (if admin or own id)
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
        // First check in User model
        let user = await User.findOne({ email }).populate('company'); // Populate company if exists
        
        if (user) {
          const isMatch = await user.comparePassword(password);
          if (!isMatch) return { success: false, message: 'Invalid credentials' };
    
          const token = user.generateToken();
          return { success: true, data: { user, token } };
        }
    
        // If not found in User model, check in Driver model
        const driver = await Driver.findOne({ email });
        if (!driver) return { success: false, message: 'User or Driver not found' };
    
        const isMatch = await driver.comparePassword(password);
        if (!isMatch) return { success: false, message: 'Invalid credentials' };
    
        const token = driver.generateToken();
        return { success: true, data: { driver, token } }; // Return driver data instead of user
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
          // Check if the logged-in user is an admin
          if (user.userType !== 'admin') {
            return { success: false, message: 'Permission denied' };
          }
    
          // Find the user by the passed ID
          const userToUpdate = await User.findById(id);
          if (!userToUpdate) {
            return { success: false, message: 'User not found' };
          }
    
          // Update the fields that are passed
          if (firstName) userToUpdate.firstName = firstName;
          if (lastName) userToUpdate.lastName = lastName;
          if (email) userToUpdate.email = email;
          if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
          if (userType) {
            userToUpdate.userType = userType;
            
            // If userType is 'company', associate a companyId
            if (userType === 'company' && companyId) {
              userToUpdate.company = mongoose.Types.ObjectId(companyId);
            } else if (userType !== 'company') {
              // If userType is not 'company', clear the company field
              userToUpdate.company = null;
            }
          }
    
          // Save the updated user
          await userToUpdate.save();
          return { success: true, data: userToUpdate };
        } else {
          // If no ID is passed, the logged-in user is updating their own profile
          const userToUpdate = await User.findById(user.id);
          if (!userToUpdate) {
            return { success: false, message: 'User not found' };
          }
    
          // Users cannot update their own userType, only personal information
          if (firstName) userToUpdate.firstName = firstName;
          if (lastName) userToUpdate.lastName = lastName;
          if (email) userToUpdate.email = email;
          if (phoneNumber) userToUpdate.phoneNumber = phoneNumber;
    
          // Save the updated user
          await userToUpdate.save();
          return { success: true, data: userToUpdate };
        }
      } catch (err) {
        console.error('Error updating user:', err);
        return { success: false, message: err.message || 'Error updating user' };
      }
    },

  changePassword: async (_, { currentPassword, newPassword, userId }, context) => {
      try {
        const { user } = context; // Get the logged-in user from context

        // Ensure the user is authenticated
        if (!user) {
          return { success: false, message: 'Unauthorized' };
        }

        let userToUpdate;

        // If userId is passed, the logged-in user must be an admin to update another user's password
        if (userId) {
          if (user.userType !== 'admin') {
            return { success: false, message: 'Permission denied. Only admins can reset other users\' passwords.' };
          }

          userToUpdate = await User.findById(userId); // Get the user to update by ID
          if (!userToUpdate) {
            return { success: false, message: 'User not found' };
          }

          // No need to check the current password if an admin is resetting someone else's password
        } else {
          // If no userId is provided, the logged-in user is updating their own password
          userToUpdate = await User.findById(user.id); // Get the logged-in user
          if (!userToUpdate) {
            return { success: false, message: 'User not found' };
          }

          // Verify the current password if updating the logged-in user's own password
          const isMatch = await userToUpdate.comparePassword(currentPassword);
          if (!isMatch) {
            return { success: false, message: 'Incorrect current password' };
          }
        }

        // Hash the new password
        userToUpdate.password = newPassword;
        await userToUpdate.save();

        return { success: true, message: 'Password updated successfully' };
      } catch (err) {
        console.error('Error changing password:', err);
        return { success: false, message: err.message || 'Error changing password' };
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
