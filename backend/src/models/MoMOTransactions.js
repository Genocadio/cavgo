// models/PhonePayment.js
const mongoose = require('mongoose');


const phonePaymentSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    match: [/^\d{10}$/, 'Please enter a valid phone number'] // Ensuring the phone number is valid (10 digits)
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: function() { return !this.agent; }, // bookingId required only if agentId is not present
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: function() { return !this.agent; }, // userId is required if agentId is not present
  },
  agent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agent', 
    required: function() { return !this.user; }, // agentId is required if userId is not present
  },
  reason: { 
    type: String, 
    required: true // The reason for the payment (e.g., service fee, purchase, etc.)
  },
  amount: { 
    type: Number, 
    required: true, 
    min: [0, 'Amount cannot be negative'] // Payment amount, must be non-negative
  },
  description: { 
    type: String, 
    required: function() { return !!this.agent; }, // description required if agentId is present
    default: '' // Optional description of the payment, if not required by validation
  },
  timestamp: { 
    type: Date, 
    default: Date.now // The timestamp when the payment was made
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Custom validation to ensure that either agentId or userId is provided, but not both
phonePaymentSchema.pre('save', function(next) {
  if (!this.agent && !this.user) {
    return next(new Error('Either agentId or userId must be provided.'));
  }
  next();
});

phonePaymentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
})

module.exports = mongoose.model('PhonePayment', phonePaymentSchema);
