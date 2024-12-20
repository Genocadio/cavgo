const mongoose = require('mongoose');
const Company = require('./Company'); // Import the Company model
const Driver = require('./Driver');   // Import the Driver model
const User = require('./User');       // Import the User model

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

// Pre-save middleware to ensure plateNumber is uppercase and only contains digits and letters
carSchema.pre('save', function(next) {
  if (this.plateNumber) {
    // Remove any non-alphanumeric characters, then convert to uppercase
    this.plateNumber = this.plateNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }
  next();
});

// Pre-save middleware to ensure only one car can have the same driver at a time
carSchema.pre('save', async function(next) {
  if (this.driver) {
    // Check if any other car currently has this driver assigned
    const existingCar = await mongoose.model('Car').findOne({ driver: this.driver });
    if (existingCar && existingCar.id !== this.id) {
      // If another car has this driver, remove the driver from that car
      existingCar.driver = null;
      await existingCar.save();
    }
  }
  next();
});

// Pre-save middleware to update the `driver` field in the Car model if changed
carSchema.pre('save', async function(next) {
  if (this.isModified('driver')) {
    // Clear the `car` field from any previous driver if necessary
    const previousCar = await mongoose.model('Car').findById(this._id);
    if (previousCar && previousCar.driver && previousCar.driver.toString() !== this.driver?.toString()) {
      await Driver.findByIdAndUpdate(previousCar.driver, { car: null });
    }

    // Update the `car` field in the new driver
    if (this.driver) {
      await Driver.findByIdAndUpdate(this.driver, { car: this._id });
    }
  }
  next();
});

// Post-remove middleware to clear the `car` field in the Driver model if the car is deleted
carSchema.post('remove', async function(doc) {
  if (doc.driver) {
    // Remove the car reference from the driver if this car is deleted
    await Driver.findByIdAndUpdate(doc.driver, { car: null });
  }
});

module.exports = mongoose.model('Car', carSchema);
