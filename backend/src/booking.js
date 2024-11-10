// Import necessary modules and models
const mongoose = require('mongoose');
const Booking = require('./models/Booking'); // Adjust path as necessary
const Ticket = require('./models/Ticket'); // Adjust path as necessary
const { generateQRCodeData, generateNFCId, calculateTicketExpiry } = require('./helpers/ticketUtils'); // Adjust path as necessary

// Connect to the database
mongoose.connect('mongodb+srv://Cadioyves:Cadio@cavgotest.9yini.mongodb.net/?retryWrites=true&w=majority&appName=cavgotest', { useNewUrlParser: true, useUnifiedTopology: true });

async function generateTicketsForConfirmedBookings() {
  try {
    // Find bookings with "Confirmed" status and no ticket assigned
    const confirmedBookings = await Booking.find({ status: 'Waiting Board', ticket: { $exists: false } });

    console.log(`Found ${confirmedBookings.length} confirmed bookings without tickets.`);

    for (const booking of confirmedBookings) {
      // Generate QR code and NFC data
      const qrCodeData = generateQRCodeData(booking._id, booking.user, booking.trip);
      const nfcId = generateNFCId(booking._id);

      // Create a new ticket
      const newTicket = await Ticket.create({
        booking: booking._id,
        user: booking.user,
        trip: booking.trip,
        qrCodeData,
        nfcId,
        validFrom: booking.createdAt,
        validUntil: calculateTicketExpiry(booking.createdAt),
      });

      // Update booking to reference the newly created ticket
      booking.ticket = newTicket._id;
      await booking.save();

      console.log(`Ticket created for booking ID: ${booking._id}`);
    }

    console.log('Ticket generation complete for all confirmed bookings.');
  } catch (error) {
    console.error('Error generating tickets:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the function
generateTicketsForConfirmedBookings();
