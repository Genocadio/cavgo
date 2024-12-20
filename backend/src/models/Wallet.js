// models/Wallet.js
const mongoose = require('mongoose');
const Card = require('./Card'); // Import the Card model

const walletSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true // Wallet must be linked to a user
  },
  card: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Card', 
    unique: true, // Enforce that each card can be linked to only one wallet
  },
  balance: { 
    type: Number, 
    required: true, 
    default: 0 // Initial balance is 0
  },
  transactions: [
    {
      type: { 
        type: String, 
        enum: ['credit', 'debit'], 
        required: true 
      }, // Type of transaction
      amount: { type: Number, required: true }, // Transaction amount
      description: { type: String }, // Optional: Description of the transaction
      date: { type: Date, default: Date.now } // Timestamp of the transaction
    }
  ]
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});


module.exports = mongoose.model('Wallet', walletSchema);
