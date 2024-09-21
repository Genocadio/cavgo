const mongoose = require('mongoose');
const Company = require('./Company'); // Import the Company model
const Driver = require('./Driver'); // Import the Driver model
const User = require('./User'); // Import the User model

const carSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  numberOfSeats: { type: Number, required: true },
  ownerCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Reference to Company model
  privateOwner: { type: String }, // Plain String for private owner
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }, // Optional reference to Driver model
  isOccupied: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Field to reference the User who added the car
}, {
  timestamps: true
});

// Transform the `_id` to `id`
carSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Car', carSchema);
