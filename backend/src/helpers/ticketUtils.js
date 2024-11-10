// utils/ticketUtils.js
const crypto = require('crypto');

// Encrypt data for security (example using AES-256-CBC)
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.randomBytes(32); // Replace with a secure, fixed key in production
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

// Generate QR code data based on booking, user, and trip IDs
function generateQRCodeData(bookingId, userId, tripId) {
  const data = `${bookingId}:${userId}:${tripId}`;
  return encrypt(data); // Secure the data with encryption
}

// Generate a unique NFC ID for the ticket
function generateNFCId(bookingId) {
  return `NFC-${bookingId}-${new Date().getTime()}`;
}

// Calculate ticket expiry time, setting expiration to 4 hours after creation
function calculateTicketExpiry(startDate) {
  const expiryDate = new Date(startDate);
  expiryDate.setHours(expiryDate.getHours() + 4); // Adjust as needed
  return expiryDate;
}

module.exports = {
  generateQRCodeData,
  generateNFCId,
  calculateTicketExpiry,
};
