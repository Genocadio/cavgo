const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing
const jwt = require('jsonwebtoken'); // Import jsonwebtoken for token generation

const posMachineSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true }, // Unique ID for the POS
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }, // Status of the POS machine
  linkedCar: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Reference to the Car model
  assignedDate: { type: Date }, // Date the POS was assigned to a car
  lastActivityDate: { type: Date }, // For tracking usage or last operation
  password: { type: String, required: true }, // Password for the POS machine
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User who owns the POS machine
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Password hashing middleware
posMachineSchema.pre('save', async function (next) {
  // Only hash the password if it's new or modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10); // Generate salt for bcrypt
      this.password = await bcrypt.hash(this.password, salt); // Hash the password
      next(); // Proceed to save the POS machine
    } catch (error) {
      next(error); // Pass the error to the next middleware
    }
  } else {
    next(); // Proceed if the password hasn't changed
  }
});

// Method to compare a plain text password with the hashed password
posMachineSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password); // Compare passwords
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate a JWT token for the POS machine
posMachineSchema.methods.generateToken = function() {
  // Generate the access token with a short expiration time (e.g., 1 hour)
  const accessToken = jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '3m' } // Access token expires in 1 hour
  );

  // Generate the refresh token with a long expiration time (e.g., 30 days)
  const refreshToken = jwt.sign(
    { id: this._id }, 
    process.env.JWT_REFRESH_SECRET, // Use a separate secret for refresh token
    { expiresIn: '30d' } // Refresh token expires in 30 days
  );

  // Return both tokens
  return { accessToken, refreshToken };
};


// Transform the `_id` to `id` in JSON output
posMachineSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('PosMachine', posMachineSchema);
