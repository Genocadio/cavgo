const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ['customer', 'admin', 'company'], 
    default: 'customer'
  },
  company: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company' 
  }, // Reference to Company model if user is a company user
  cards: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Card' // Reference to Card model for linked cards
    }
  ],
  defaultCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card', // Reference to Card model for the user's default card
  }
}, {
  timestamps: true
});

// Middleware to format fields before saving the user
userSchema.pre('save', async function(next) {
  try {
    // Format firstName to be fully capitalized
    if (this.firstName) {
      this.firstName = this.firstName.toUpperCase();
    }

    // Format lastName such that each word starts with a capital letter
    if (this.lastName) {
      this.lastName = this.lastName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
        .join(' ');
    }

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
userSchema.pre('save', async function(next) {
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
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '7h' });
};

module.exports = mongoose.model('User', userSchema);
