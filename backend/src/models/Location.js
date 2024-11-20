const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['bus_stop', 'route_stop', 'restaurant', 'other'], 
    required: true
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: true },  
  googlePlaceId: { type: String, required: true },  
}, {
  timestamps: true
});

// Cascade delete when location is removed
locationSchema.pre('remove', async function(next) {
  try {
    // Step 1: Delete all Routes that reference this location
    await mongoose.model('Route').deleteMany({
      $or: [{ origin: this._id }, { destination: this._id }]
    });

    // Step 2: Remove the stopPoints that reference this location in Trip
    await mongoose.model('Trip').updateMany(
      { 'stopPoints.location': this._id },
      { $pull: { stopPoints: { location: this._id } } }
    );

    next();
  } catch (err) {
    next(err);
  }
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
