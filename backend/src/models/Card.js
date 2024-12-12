// models/Card.js
const mongoose = require('mongoose');
const { generateValidID } = require('../helpers/generateId')

const cardSchema = new mongoose.Schema({
  nfcId: { type: String, required: true, unique: true }, // Unique identifier for the NFC card
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Reference to the linked User
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who registered the card
  cardId: { type: String, }, // Custom-generated unique card ID
  active: { type: Boolean, default: false }, // Flag to indicate if the card is active
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Middleware to generate cardId before saving
cardSchema.pre('save', function(next) {
  if (!this.cardId) {
    // Generate a unique cardId using a custom logic
    this.cardId = generateValidID();
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);
