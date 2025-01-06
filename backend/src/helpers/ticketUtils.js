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

/**
 * Generate a secure, self-checking ID based on a trip ID.
 * @param {string} tripId - The trip ID to generate the unique number from.
 * @returns {string} A secure, self-checking unique ID.
 */
function generateSecureId(tripId) {
  console.log("Trip to link in val" + tripId + typeof(tripId));
  if (!tripId || typeof tripId !== 'string') {
    throw new Error('Invalid trip ID. It must be a non-empty string.');
  }

  // Step 1: Extract numeric equivalent of the trip ID
  const numericTripId = tripId
    .split('')
    .map((char) => parseInt(char, 16)) // Convert hexadecimal or numeric characters
    .filter((num) => !isNaN(num)); // Remove non-numeric characters

  // Step 2: Generate a Luhn-compatible base number
  const baseNumber = numericTripId.join('');
  const checksum = calculateLuhnChecksum(baseNumber);

  // Combine base number with checksum to create a valid Luhn number
  const luhnNumber = baseNumber + checksum;

  // Step 3: Multiply each digit of the Luhn number with the corresponding trip ID digit
  const secureId = luhnNumber
    .split('')
    .map((digit, index) => {
      const multiplier = numericTripId[index % numericTripId.length] || 1; // Cycle through trip ID digits
      return (parseInt(digit) * multiplier).toString();
    })
    .join('');

  // Return the secure ID
  return secureId;
}

/**
 * Calculate Luhn checksum for a number string.
 * @param {string} number - The base number to calculate the checksum for.
 * @returns {number} The Luhn checksum digit.
 */
function calculateLuhnChecksum(number) {
  let sum = 0;
  let isSecond = false;

  // Process digits from right to left
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i], 10);

    if (isSecond) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isSecond = !isSecond;
  }

  // Return the checksum digit
  return (10 - (sum % 10)) % 10;
}



module.exports = {
  generateQRCodeData,
  generateNFCId,
  calculateTicketExpiry,
  generateSecureId,

};
