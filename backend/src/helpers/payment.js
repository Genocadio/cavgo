const Booking = require('../models/Booking'); // Import the Booking model
const { db } = require('../firebase'); // Import Firestore instance

// Function to start the payment check timer
const startPaymentCheckTimer = async (bookingId) => {
  try {
    // Initialize a variable to keep track of the elapsed time
    console.log('monitoring: ', bookingId)
    let elapsedTime = 0;

    // Define the interval for checking payment
    const paymentCheckInterval = setInterval(async () => {
      // Fetch booking from MongoDB
      const booking = await Booking.findById(bookingId).populate('trip');
      if (!booking) {
        console.error('Booking not found');
        clearInterval(paymentCheckInterval); // Stop the timer if the booking is not found
        return;
      }

      // Simulate checking if payment is done (replace this with actual payment checking logic)
      const paymentDone = await checkIfPaymentIsDone(booking);

      if (paymentDone) {
        clearInterval(paymentCheckInterval); // Stop the timer if payment is confirmed
        console.log('Payment confirmed for booking ID:', bookingId);

        // Update the booking status to 'Waiting Board'
        await Booking.findByIdAndUpdate(bookingId, { status: 'Waiting Board' });
        
        return; // Exit the function after updating the status
      }

      // Increase the elapsed time by 30 seconds
      elapsedTime += 30;

      // Check if 5 minutes (300 seconds) have passed
      if (elapsedTime >= 300) {
        clearInterval(paymentCheckInterval); // Stop the timer after 5 minutes

        // Update the booking status to 'Expired'
        await Booking.findByIdAndUpdate(bookingId, { status: 'Expired' });

        // Fetch the trip from Firebase
        const tripId = booking.trip._id.toString(); // Get the trip ID from the booking
        const numberOfTickets = booking.numberOfTickets; // Number of tickets from the booking

        // Fetch trip document from Firebase
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
          console.error('Trip not found in Firebase');
        } else {
          const tripData = tripDoc.data();
          const updatedAvailableSeats = tripData.availableSeats + numberOfTickets; // Add back the tickets

          // Update the trip in Firebase with the new number of available seats
          await tripRef.update({ availableSeats: updatedAvailableSeats });

          console.log('Booking ID:', bookingId, 'has been marked as Expired and tickets returned to trip ID:', tripId);
        }
      }
    }, 30000); // 30 seconds interval
  } catch (error) {
    console.error('Error in payment check timer:', error.message);
  }
};

// Mock function to simulate payment checking (replace with actual logic)
const checkIfPaymentIsDone = async (booking) => {
  // Simulate payment status (e.g., random success for demonstration)
  return Math.random() < 0.1; // 20% chance to simulate successful payment
};

module.exports = { startPaymentCheckTimer };
