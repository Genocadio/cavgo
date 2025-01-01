const companyResolvers = require('./company');
const driverResolvers = require('./driver');
const userResolvers = require('./user');
const carResolvers = require('./car');
const locationResolvers = require('./location');
const routeResolvers = require('./route');
const tripResolvers = require('./trip');
const bookingResolvers = require('./Booking');
const paymentResolvers = require('./payments');
const scheduleResolvers = require('./scheduleResolvers');
const tripPresetResolvers = require('./tripPresetResolvers');
const posResolvers = require('./PosMachine');
const cardResolvers = require('./Cards');
const walletResolvers = require('./wallet');
const agentResolvers = require('./Agents');

const resolvers = {
  Query: {
    ...locationResolvers.Query,
    ...routeResolvers.Query,
    ...companyResolvers.Query,
    ...driverResolvers.Query,
    ...userResolvers.Query,
    ...carResolvers.Query,
    ...tripResolvers.Query,
    ...bookingResolvers.Query,
    ...paymentResolvers.Query,
    ...scheduleResolvers.Query,
    ...tripPresetResolvers.Query,
    ...posResolvers.Query,
    ...cardResolvers.Query,
    ...walletResolvers.Query,
    ...agentResolvers.Query
    

  },

  Mutation: {
    ...companyResolvers.Mutation,
    ...driverResolvers.Mutation,
    ...userResolvers.Mutation,
    ...carResolvers.Mutation,
    ...locationResolvers.Mutation,
    ...routeResolvers.Mutation,
    ...tripResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...scheduleResolvers.Mutation,
    ...tripPresetResolvers.Mutation,
    ...posResolvers.Mutation,
    ...cardResolvers.Mutation,
    ...walletResolvers.Mutation,
    ...agentResolvers.Mutation
  
  },

  Subscription: {
    ...bookingResolvers.Subscription,
  },

  Driver: driverResolvers.Driver,
  Car: carResolvers.Car,
  Route: routeResolvers.Route,
  Trip: tripResolvers.Trip,
  Booking: bookingResolvers.Booking,
  Payment: paymentResolvers.Payment,
  Schedule: scheduleResolvers.Schedule,
  Card: cardResolvers.Card,
  Wallet: walletResolvers.Wallet,
  User: userResolvers.User,
  

};

module.exports = resolvers;
