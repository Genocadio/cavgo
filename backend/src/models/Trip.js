const mongoose = require('mongoose');
const Car = require('./Car');
const User = require('./User');
const Location = require('./Location'); // Import the Location model

const tripSchema = new mongoose.Schema({
  route: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Route', 
    required: true 
  },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true 
  },
  boardingTime: { 
    type: Date, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled',
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  availableSeats: { 
    type: Number, 
    default: 0 
  },
  stopPoints: [{
    location: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Location', 
      required: true 
    },
    price: { 
      type: Number, 
      default: 0 // Ensure price defaults to 0
    }
  }],
  
  reverseRoute: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
});

// Middleware to set availableSeats based on car's number of seats before saving
tripSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('car')) {
    try {
      const car = await Car.findById(this.car);
      if (car) {
        this.availableSeats = car.numberOfSeats; // Set available seats to the car's seat count
      }
    } catch (err) {
      console.error('Error fetching car for availableSeats:', err);
    }
  }
  next();
});

// Transform _id to id for JSON responses
tripSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Trip', tripSchema);
