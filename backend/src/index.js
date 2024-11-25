const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const { userTypes, driverTypes, companyTypes, carTypes, locationTypes, routeTypes, tripTypes, basicQueryTypes, bookingsTypes, paymentTypes, scheduleTypes, tripPresttypes, posMachineTypes } = require('./graphql/typeDefs');
const resolvers = require('./resolvers/resolvers');
const logger = require('./middlewares/logger');
const authenticate = require('./middlewares/authMiddleware');

const { ApolloServer } = require('@apollo/server')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const http = require('http')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
dotenv.config();

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
  scheduleTypes,
  tripPresttypes,
  posMachineTypes
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo Connected'))
  .catch(err => console.log(err));

// Middleware for logging HTTP requests
const requestLogger = morgan('combined', {
  stream: {
    write: message => logger.info(message.trim())
  }
});

// Middleware for handling errors
const errorLogger = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);
  res.status(500).send('Internal Server Error');
};

// Apollo Server initialization function
async function startApolloServer() {
  const app = express();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create HTTP server
  const httpServer = http.createServer(app)

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Use `graphql-ws` with the WebSocket server
  const serverCleanup = useServer({ schema }, wsServer);

  // Initialize Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  // Apply Apollo middleware to Express
  app.use(cors());
  app.use(requestLogger);

  app.use(authenticate);
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        user: req.user,
      };
    }
  }));

  app.get('/', (req, res) => {
    res.status(200).send({
      message: 'Cannot GET /',
    });
  });


  // Error handling middleware
  app.use(errorLogger);

  // Start HTTP and WebSocket servers
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPah}`);
    console.log(`📡 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer();
