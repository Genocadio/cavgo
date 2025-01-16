const crypto = require('crypto');

// Secret key for signing QR code data (store securely, e.g., in environment variables)
const SECRET_KEY = process.env.QR_SECRET_KEY || 'your-secure-secret-key';

/**
 * Generate QR code data for a ticket
 * @param {Object} ticket - The ticket object
 * @returns {string} - The QR code data
 */
function generateQrCodeData(ticket) {
  // Ensure either user or agent is present
  if ((!ticket.user && !ticket.agent) || (ticket.user && ticket.agent)) {
    throw new Error('Either user or agent must be present, but not both.');
  }

  // Construct payload
  const payload = {
    bookingId: ticket.booking.toString(),
    ownerId: ticket.user ? ticket.user.toString() : ticket.agent.toString(),
    tripId: ticket.trip.toString(),
    validFrom: ticket.validFrom.toISOString(),
    validUntil: ticket.validUntil.toISOString(),
  };

  // Create a secure hash
  const hash = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Combine payload and hash
  const qrCodeData = {
    payload,
    hash,
  };

  // Return base64-encoded QR code data
  return Buffer.from(JSON.stringify(qrCodeData)).toString('base64');
}

module.exports = generateQrCodeData;
