const mongoose = require('mongoose');
const Company = require('./Company'); // Import the Company model
const Car = require('./Car');         // Import the Car model
const bcrypt = require('bcrypt');     // For hashing passwords
const jwt = require('jsonwebtoken');

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, required: true },
  type: { type: String, enum: ['private', 'company'], required: true },
  license: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Reference to the Company model
  password: { type: String, required: true }, // Add password field
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' } // Optional reference to the Car model
}, {
  timestamps: true
});

// Hash password before saving the driver
driverSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update the `driver` field in the Car model
driverSchema.pre('save', async function(next) {
  if (this.isModified('car')) {
    // Clear the `driver` field from any previous car if necessary
    const previousDriver = await mongoose.model('Driver').findById(this._id);
    if (previousDriver && previousDriver.car && previousDriver.car.toString() !== this.car?.toString()) {
      await Car.findByIdAndUpdate(previousDriver.car, { driver: null });
    }

    // Update the `driver` field in the new car
    if (this.car) {
      await Car.findByIdAndUpdate(this.car, { driver: this._id });
    }
  }
  next();
});

// Post-remove middleware to clear the `driver` field in the Car model if the driver is removed
driverSchema.post('remove', async function(doc) {
  if (doc.car) {
    // Remove the driver reference from the car if this driver is deleted
    await Car.findByIdAndUpdate(doc.car, { driver: null });
  }
});

// Method to compare passwords
driverSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

driverSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Transform the `_id` to `id`
driverSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password; // Do not include password in the response
  }
});

module.exports = mongoose.model('Driver', driverSchema);
