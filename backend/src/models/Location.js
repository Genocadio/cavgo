// models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g., "Main Bus Stop"
  type: { 
    type: String, 
    enum: ['bus_stop', 'route_stop', 'restaurant', 'other'],  // Adjust based on your needs
    required: true 
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: true },  // Full address
  googlePlaceId: { type: String, required: true },  // Google Place ID
}, {
  timestamps: true
});

// Transform _id to id for consistency
locationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Location', locationSchema);
