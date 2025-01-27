const jwt = require('jsonwebtoken');
const logger = require('./logger');
require('dotenv').config();
const User = require('../models/User');
const Driver = require('../models/Driver');
const Agent = require('../models/Agents');
const PosMachine = require('../models/PosMachine');
const SuperUser = require('../models/superUser');

const SECRET = process.env.JWT_SECRET;

// Function to sanitize object
const sanitizeObject = (obj) => {
  const { __v, _id, ...rest } = obj.toObject();
  return { id: _id.toString(), ...rest };
};

// Models to check in sequence
const models = [
  { name: 'user', model: User },
  { name: 'driver', model: Driver, assignUser: true }, // Added the assignUser flag for driver
  { name: 'agent', model: Agent, checkStatus: true, errorMessage: 'Agent is inactive' },
  { name: 'pos', model: PosMachine, checkStatus: true, errorMessage: 'POS machine is inactive' },
  { name:'superUser', model: SuperUser, checkStatus: true, errorMessage: 'Super user is inactive' } // Added the checkStatus flag for superUser
];

// General Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  // Initialize all model fields to null
  models.forEach(model => {
    req[model.name] = null;
  });

  if (!token) {
    logger.info(`No token provided. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded.id) {
      throw new Error('Token invalid');
    }

    // Iterate through all models to check the token
    for (const { name, model, checkStatus, errorMessage, assignUser } of models) {
      let user = await model.findById(decoded.id);
      
      // If status check is required and user is inactive, throw error
      if (checkStatus && user && user.status !== 'active') {
        throw new Error(errorMessage);
      }

      if (user) {
        // Sanitize and attach the user object to the request
        logger.info(`User authenticated: ${decoded.id}. model ${name} Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
        req[name] = sanitizeObject(user);

        // If it's a driver, assign user as well
        if (assignUser && name === 'driver') {
          req.user = req.driver; // If a driver is found, assign to req.user as well
        }

        return next(); // Stop iteration and return the response once a user is found
      }
    }

    // If no user is found in any of the models
    throw new Error('User not found in any model');

  } catch (err) {
    // Log the error and set all models to null
    logger.error(`Authentication Error: ${err.message}. Request Method: ${req.method}, Request URL: ${req.originalUrl}`);
    
    // Set all models to null on authentication error
    models.forEach(model => {
      req[model.name] = null;
    });

    next();
  }
};

module.exports = authenticate;
