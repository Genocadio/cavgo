const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary
const logger = require('./logger'); // Ensure this is configured correctly
require('dotenv').config();
const SECRET = process.env.JWT_SECRET;

// Function to sanitize user object
const sanitizeUser = (user) => {
  const { __v, _id, ...rest } = user.toObject(); // Convert to plain object and destructure
  return {
    id: _id.toString(), // Convert _id to string
    ...rest, // Spread the rest of the user fields
  };
};

const authenticate = async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization || '';
  // console.log('authHeader:', authHeader);

  // Ensure the token starts with 'Bearer ' and extract it
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : ''; // Use substring to remove 'Bearer ' prefix
  
  if (!token) {
    // Log the absence of a token and proceed without authentication
    // logger.info('No token provided');
    req.user = null; // Ensure request.user is set to null if no token
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log(decoded);

    if (!decoded.id) {
      throw new Error('Token invalid');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Sanitize and attach user object to the request
    req.user = sanitizeUser(user); 
    // console.log('User:', req.user);
    next();
  } catch (err) {
    // Log the error and set user to null
    logger.error('Authentication Error:', err.message);
    req.user = null; // Ensure request.user is set to null on authentication error
    next();
  }
};

module.exports = authenticate;
