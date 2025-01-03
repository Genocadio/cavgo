const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // Ensure one ticket per booking
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  qrCodeData: { // Data to be encoded in QR code
    type: String,
    required: true
  },
  nfcId: { // NFC ID associated with the ticket
    type: String,
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isValid: { // Status to track if the ticket has been used
    type: Boolean,
    default: true
  },
}, {
  timestamps: true,
});

ticketSchema.pre('validate', function (next) {
  if ((!this.agent && !this.user) || (this.agent && this.user)) {
    return next(new Error('Either agent or user must be present, but not both.'));
  }
  next();
});

// Transform _id to id for JSON responses
ticketSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
