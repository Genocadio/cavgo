const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary
const Driver = require('../models/Driver'); // Import the Driver model
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

  // Ensure the token starts with 'Bearer ' and extract it
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  if (!token) {
    // Log the absence of a token and proceed without authentication
    logger.info(`No token provided. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    req.user = null; // Ensure request.user is set to null if no token
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    
    if (!decoded.id) {
      throw new Error('Token invalid');
    }

    // Try finding the user in User model first
    let user = await User.findById(decoded.id);
    
    // If not found in User, try finding in Driver model
    if (!user) {
      user = await Driver.findById(decoded.id);
    }
    
    if (!user) {
      throw new Error('User not found');
    }

    // Sanitize and attach user object to the request
    console.log('User:', user);
    req.user = sanitizeUser(user);
    next();
  } catch (err) {
    // Log the error and set user to null
    logger.error(`Authentication Error: ${err.message}. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    req.user = null; // Ensure request.user is set to null on authentication error
    next();
  }
};

module.exports = authenticate;
