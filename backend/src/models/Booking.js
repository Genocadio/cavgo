const mongoose = require('mongoose');
const Trip = require('./Trip'); // Import the Trip model
const User = require('./User'); // Import the User model

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  trip: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  numberOfTickets: { 
    type: Number, 
    required: true, 
    min: 1 // Ensure at least one ticket is booked
  },
  price: { 
    type: Number, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Expired', 'Boarded', 'Waiting Board', 'Late'],
    default: 'Pending', // Default status is Pending
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Transform _id to id for JSON responses
bookingSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
