const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const { userTypes, driverTypes, companyTypes, carTypes, locationTypes, routeTypes, tripTypes, basicQueryTypes, bookingsTypes, paymentTypes, scheduleTypes } = require('./graphql/typeDefs');
const resolvers = require('./resolvers/resolvers');
const logger = require('./middlewares/logger'); // Ensure this is configured correctly
const authenticate = require('./middlewares/authMiddleware'); // Import authentication middleware

const typeDefs = [
  userTypes,
  driverTypes,
  companyTypes,
  carTypes,
  locationTypes,
  routeTypes,
  tripTypes,
  basicQueryTypes,
  bookingsTypes,
  paymentTypes,
  scheduleTypes
];

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo Connected'))
  .catch(err => console.log(err));

// Middleware for logging HTTP requests
const requestLogger = morgan('combined', {
  stream: {
    write: message => logger.info(message.trim()) // Log requests to Winston
  }
});

// Middleware for handling errors
const errorLogger = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`); // Log errors to Winston
  res.status(500).send('Internal Server Error'); // Send a generic error response
};

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Add authenticated user to context
      return { user: req.user };
    },
  });

  await server.start();

  const app = express();
  app.use(cors());

  // Apply logging middleware
  // app.use(requestLogger);
  
  // Apply authentication middleware
  app.use(authenticate);
  
  // Apply Apollo Server middleware
  server.applyMiddleware({ app });

  // Apply error handling middleware
  // app.use(errorLogger);

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startApolloServer();
