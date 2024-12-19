const Booking = require('../models/Booking');
const Card = require('../models/Card');
const Wallet = require('../models/Wallet');
const payWithCard = async (bookingId) => {
    try {
      // Find the booking by ID
      const booking = await Booking.findById(bookingId);
  
      // If booking not found, return false
      if (!booking) {
        console.log('Booking not found:', bookingId);
        return false;
      }


  
      // Return true if payment status is 'paid', otherwise return false
      return booking.paymentStatus === 'paid';
    } catch (err) {
      console.error('Error checking payment status for booking:', err);
      return false;
    }
  };
  
  export default payWithCard;
  
 
  const prcesspayment = async (bookingid, cardid) => {
    try {
        const card = await Card.findOne({  cardid });
        if (!card) {
            console.log('Card not found:', cardid);
            return false;
        }
        const booking = await Booking.findById(bookingid);
        if (!booking) {
            console.log('Booking not found:', bookingid);
            return false;
        }
        const walletid = card.wallet;
        const wallet = await Wallet.findById(walletid);
        if (!wallet) {
            console.log('Wallet not found:', walletid);
            return false;
        }
        if (wallet.balance < booking.totalAmount) {
            console.log('Insufficient balance in wallet:', walletid);
            return false;
        }
        wallet.balance -= booking.totalAmount;
        await wallet.save();
        return true;
    } catch (err) {
        console.error('Error processing payment:', err);
        return false;
    }
  }