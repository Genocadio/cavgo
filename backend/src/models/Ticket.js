const mongoose = require('mongoose');
const generateQrCodeData = require('../helpers/qrcodegen')

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

ticketSchema.pre('save', function (next) {
  try {
    // Ensure qrCodeData is only generated if it's missing or if fields affecting it are modified
    if (this.isNew || this.isModified('booking') || this.isModified('user') || this.isModified('agent') || this.isModified('trip') || this.isModified('validFrom') || this.isModified('validUntil')) {
      this.qrCodeData = generateQrCodeData(this);
    }
    next();
  } catch (error) {
    next(error);
  }
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
