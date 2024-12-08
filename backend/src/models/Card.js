// models/Card.js
const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  nfcId: { type: String, required: true }, // Unique identifier for the NFC card
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the linked User
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who registered the card
  cardId: { type: String, }, // Custom-generated unique card ID
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Middleware to generate cardId before saving
cardSchema.pre('save', function(next) {
  if (!this.cardId) {
    // Generate a unique cardId using a custom logic
    this.cardId = `CARD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);
