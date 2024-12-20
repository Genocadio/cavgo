const mongoose = require('mongoose');
const { generateValidID } = require('../helpers/generateId');
const User = require('./User'); // Import User model
const Wallet = require('./Wallet');


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
// Modify the post-save middleware to create a wallet for the card if the user is valid
cardSchema.post('save', async function(doc, next) {
  if (doc.user) { // Ensure the card is linked to a user
    try {
      // Check if a wallet already exists for this card
      let wallet = await Wallet.findOne({ card: doc._id });

      if (!wallet) { // Create a new wallet only if it doesn't exist
        wallet = new Wallet({
          user: doc.user, // Link the wallet to the same user as the card
          card: doc._id,  // Link the wallet to this card
          balance: 0       // Set the initial balance to 0
        });

        // Save the wallet to the database
        await wallet.save();
      }

      // Update the card to reference the existing or newly created wallet
      if (!doc.wallet || doc.wallet.toString() !== wallet._id.toString()) {
        doc.wallet = wallet._id;
        await doc.save(); // Save the card again only if wallet was updated
        
      }

      // Optionally: You can update the user model to add the wallet reference to the user
      // await User.findByIdAndUpdate(doc.user, { $set: { wallet: wallet._id } });

    } catch (error) {
      return next(error);
    }
  }
  next();
});



// Middleware to add the card ID to the user's cards field after saving
cardSchema.post('save', async function(doc, next) {
  if (doc.user) { // Ensure the card is linked to a user
    try {
      const user = await User.findById(doc.user);

      // If the user has no cards, set this card as the default card
      if (!user.cards || user.cards.length === 0) {
        // Update the user's cards array and set this card as the defaultCard
        await User.findByIdAndUpdate(
          doc.user,
          { 
            $addToSet: { cards: doc._id },  // Add the new card to the cards array if not already present
            $set: { defaultCard: doc._id }   // Set this card as the defaultCard
          },
          { new: true }
        );
      } else {
        // If the user already has other cards, just add this card without changing defaultCard
        await User.findByIdAndUpdate(
          doc.user,
          { $addToSet: { cards: doc._id } },  // Add the new card to the cards array if not already present
          { new: true }
        );
      }

    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Card', cardSchema);
