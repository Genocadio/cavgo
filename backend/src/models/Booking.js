const mongoose = require('mongoose');
const Ticket = require('./Ticket'); // Import the Ticket model
const Card = require('./Card'); // Import the Card model
const { generateSecureId, generateNFCId, calculateTicketExpiry } = require('../helpers/ticketUtils'); // Import helper functions

const bookingSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
  },
  clientName: {
    type: String,
    default: null,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
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
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Expired', 'Boarded', 'Waiting Board', 'Late'],
    default: 'Pending', // Default status is Pending
  },
  ticket: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ticket', 
    required: false // Optional field for referencing the generated ticket
  },
  pos: { type: mongoose.Schema.Types.ObjectId, ref: 'PosMachine' },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Middleware to create a ticket when the booking status is set to "Confirmed"

bookingSchema.pre('validate', function (next) {
  if ((!this.agent && !this.user) || (this.agent && this.user)) {
    return next(new Error('Either agent or user must be present, but not both.'));
  }
  next();
});


bookingSchema.pre('save', async function (next) {
  if (this.isModified('status') && (this.status === 'Confirmed' || this.status === 'Waiting Board')) {
    // Check if a ticket already exists for this booking
    const existingTicket = await Ticket.findOne({ booking: this._id });
    if (existingTicket) {
      this.ticket = existingTicket._id; // Link the existing ticket to the booking
      return next();
    }

    const card = await Card.findOne( this.card )
    // Generate QR code and NFC data for the ticket
    const qrCodeData = generateSecureId(this.trip);
    const nfcId = generateNFCId(this._id);
    if(this.agent != null) {
      const newTicket = await Ticket.create({
        booking: this._id,
        agent: this.agent,
        trip: this.trip,
        qrCodeData,
        nfcId: card.nfcId,
        validFrom: this.createdAt,
        validUntil: calculateTicketExpiry(this.createdAt),
      });
  
      // Associate the new ticket with this booking
      this.ticket = newTicket._id;

      return next();
    }


    // Create the ticket
    const newTicket = await Ticket.create({
      booking: this._id,
      user: this.user,
      trip: this.trip,
      qrCodeData,
      nfcId: card.nfcId,
      validFrom: this.createdAt,
      validUntil: calculateTicketExpiry(this.createdAt),
    });

    // Associate the new ticket with this booking
    this.ticket = newTicket._id;
  }
  next();
});

bookingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    // Delete all tickets associated with the booking
    await Ticket.deleteMany({ booking: doc._id });
  }
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
