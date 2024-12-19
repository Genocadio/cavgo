const mongoose = require('mongoose');
const { generateValidID } = require('../helpers/generateId');
const User = require('./User'); // Import User model

const cardSchema = new mongoose.Schema({
  nfcId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardId: { type: String },
  wallet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet', 
    unique: true, 
    sparse: true 
  },
  active: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Middleware to generate cardId before saving
cardSchema.pre('save', function(next) {
  if (!this.cardId) {
    this.cardId = generateValidID();
  }
  next();
});

// Middleware to add the card ID to the user's cards field after saving
cardSchema.post('save', async function(doc, next) {
  if (doc.user) { // Check if user is not null
    try {
      await User.findByIdAndUpdate(
        doc.user, 
        { $addToSet: { cards: doc._id } }, // Add card ID if not already present
        { new: true }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);
