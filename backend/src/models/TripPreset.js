const mongoose = require('mongoose');
const Location = require('./Location'); // Import the Location model

const tripPresetSchema = new mongoose.Schema({
  route: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Route', 
    required: true 
  },
  stopPoints: [{
    location: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Location', 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  reverseRoute: { 
    type: Boolean, 
    default: false 
  },
  presetName: {
    type: String,
    required: true,
    unique: true,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company',  
  },
}, {
  timestamps: true,
});

// Middleware to check for duplicate presets before saving
tripPresetSchema.pre('save', async function(next) {
  try {
    // Query to check for duplicates
    console.log('Checking for duplicate presets')
    const duplicate = await mongoose.model('TripPreset').findOne({
      route: this.route,
      reverseRoute: this.reverseRoute,
      company: this.company,
      stopPoints: { $size: this.stopPoints.length },
      'stopPoints.location': { $all: this.stopPoints.map(sp => sp.location) },
      'stopPoints.price': { $all: this.stopPoints.map(sp => sp.price) },
    });

    if (duplicate) {
      const error = new Error('A preset with the same fields already exists for this user and company.');
      error.code = 409; // Conflict
      return next(error);
    }

    next(); // Proceed to save if no duplicate is found
  } catch (err) {
    next(err);
  }
});

// Transform _id to id for JSON responses
tripPresetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('TripPreset', tripPresetSchema);
