const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const superUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true, // First name of the super user
    },
    lastName: {
      type: String,
      required: true, // Last name of the super user
    },
    email: {
      type: String,
      unique: true,
      required: true, // Unique email for the super user
      lowercase: true, // Ensures email is always stored in lowercase
    },
    phoneNumber: {
      type: String,
      required: true, // Phone number of the super user
    },
    password: {
      type: String,
      required: true, // Password for the super user
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active', // Default status is active
    },
  },
  {
    timestamps: true, // Includes createdAt and updatedAt
  }
);

// Middleware to format fields before saving the super user
superUserSchema.pre('save', async function (next) {
  try {
    // Format email to lowercase
    if (this.email) {
      this.email = this.email.toLowerCase();
    }

    // Format phoneNumber to only contain numbers (remove non-digit characters)
    if (this.phoneNumber) {
      this.phoneNumber = this.phoneNumber.replace(/\D/g, ''); // Keep only digits
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Hash password before saving
superUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (err) {
    next(err);
  }
});

// Compare provided password with hashed password
superUserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

superUserSchema.methods.generateToken = function () {
  // Generate the access token with a short expiration time (e.g., 1 hour)
  const accessToken = jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } // Access token expires in 1 hour
  );

  // Generate the refresh token with a long expiration time (e.g., 30 days)
  const refreshToken = jwt.sign(
    { id: this._id }, 
    process.env.JWT_REFRESH_SECRET, // Use a separate secret for refresh token
    { expiresIn: '3h' } // Refresh token expires in 30 days
  );

  // Return both tokens
  return { accessToken, refreshToken };
};


module.exports = mongoose.model('SuperUser', superUserSchema);
