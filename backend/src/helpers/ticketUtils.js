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
 * @throws {Error} If the trip ID is invalid.
 */
function generateSecureId(tripId) {
  console.log(`Trip to link in val: ${tripId} (type: ${typeof tripId})`);

  // Validate the tripId input
  if (!tripId || typeof tripId !== 'string') {
    throw new Error('Invalid trip ID. It must be a non-empty string.');
  }

  // Extract numeric equivalent of the trip ID
  const numericTripId = tripId
    .split('')
    .map((char) => parseInt(char, 16)) // Convert hexadecimal characters to numbers
    .filter((num) => !isNaN(num)); // Remove invalid characters

  if (numericTripId.length === 0) {
    throw new Error('Trip ID contains no valid numeric or hexadecimal characters.');
  }

  // Calculate the sum of digits from tripId
  const tripIdSum = numericTripId.reduce((sum, num) => sum + num, 0);

  if (tripIdSum === 0) {
    throw new Error('Sum of digits from trip ID is zero, division is not possible.');
  }

  // Generate a random Luhn-compatible number
  const randomBaseNumber = generateRandomNumber(8); // Adjust length as needed
  const checksum = calculateLuhnChecksum(randomBaseNumber);
  const luhnNumber = randomBaseNumber + checksum;

  // Divide the Luhn number by the sum of tripId digits
  const dividedNumber = Math.floor(Number(luhnNumber) / tripIdSum);

  // Add the sum of digits to the result
  const secureId = `${dividedNumber}-${tripIdSum}`;

  return secureId;
}

/**
 * Generate a random numeric string of the specified length.
 * @param {number} length - Length of the random number to generate.
 * @returns {string} Random numeric string.
 */
function generateRandomNumber(length) {
  let randomNumber = '';
  for (let i = 0; i < length; i++) {
    randomNumber += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }
  return randomNumber;
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
