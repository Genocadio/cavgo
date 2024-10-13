const companyResolvers = require('./company');
const driverResolvers = require('./driver');
const userResolvers = require('./user');
const carResolvers = require('./car');
const locationResolvers = require('./location');
const routeResolvers = require('./route');
const tripResolvers = require('./trip');
const bookingResolvers = require('./Booking');
const paymentResolvers = require('./payments');

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
  
  },

  Driver: driverResolvers.Driver,
  Car: carResolvers.Car,
  Route: routeResolvers.Route,
  Trip: tripResolvers.Trip,
  Booking: bookingResolvers.Booking,
  Payment: paymentResolvers.Payment,

};

module.exports = resolvers;
