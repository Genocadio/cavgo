const jwt = require('jsonwebtoken');
const logger = require('./logger'); // Ensure this is configured correctly
const Agent = require('../models/Agents'); // Import the Agent model
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

const authAgent= async (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization || '';

  // Ensure the token starts with 'Bearer ' and extract it
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  if (!token) {
    // Log the absence of a token and proceed without authentication
    logger.info(`No token provided. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    req.agent = null; // Ensure request.user is set to null if no token
    return next();
  }

  try {
    let decoded = jwt.verify(token, SECRET);
    if (!decoded.id) {
      throw new Error('Token invalid');
    }

    // Try finding the user in User model first
    let agent = await Agent.findById(decoded.id);

    if(agent && agent.status !== "active") {
        throw new Error('POS machine is inactive');
    }
  
    
    if (!agent) {
      throw new Error('Pos  not found');
    }

    // Sanitize and attach user object to the request
    console.log('Agent:', agent);
    req.agent = sanitizeUser(agent);
    next();
  } catch (err) {
    // Log the error and set user to null
    logger.error(`Authentication Error: ${err.message}. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    req.agent = null; // Ensure request.user is set to null on authentication error
    next();
  }
};

module.exports = authAgent;
