// models/Route.js
const mongoose = require('mongoose');
const Location = require('./Location'); // Reference to Location model

const routeSchema = new mongoose.Schema({
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  googleMapsRouteId: { type: String, required: true },
  price: { type: Number, required: true }, // Price for the route
}, {
  timestamps: true,
});

// Transform _id to id
routeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Route', routeSchema);
