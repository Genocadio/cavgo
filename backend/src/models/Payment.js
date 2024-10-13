const mongoose = require('mongoose');
const bookingSchema = require('./Booking'); // Import Booking schema
const Car = require('./Car'); // Import Car schema for reference
const User = require('./User'); // Import User schema for reference

const paymentSchema = new mongoose.Schema({
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  amountPaid: { 
    type: Number, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Completed', 'Failed'], 
    default: 'Pending' 
  },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car',  // Storing reference to the Car object
    required: true 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // Reference to the user who made the payment
    required: true 
  },
  name: { 
    type: String, 
    default: ''  // Will be set to user's first name if not provided
  }
});

// Middleware to set the default name if not provided
paymentSchema.pre('save', async function(next) {
  if (!this.name || this.name.trim() === '') {
    try {
      const user = await User.findById(this.userId); // Fetch the user by userId
      if (user && user.firstName) {
        this.name = user.firstName; // Set name to user's first name if not provided
      }
    } catch (err) {
      console.error('Error fetching user for name:', err);
    }
  }
  next();
});

// Transform _id to id for JSON responses
paymentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
