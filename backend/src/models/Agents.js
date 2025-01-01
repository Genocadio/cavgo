const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['credit', 'debit'], // Transaction types
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String, // Optional transaction description
  },
  date: {
    type: Date,
    default: Date.now, // Default to current date/time
  },
});

const walletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0, // Default wallet balance
    required: true,
  },
  transactions: [transactionSchema], // Array of transaction objects
});

const agentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        },
    wallet: {
      type: walletSchema, // Embeds wallet schema
      required: true,
      default: () => ({ balance: 0, transactions: [] }),
    },
  },
  {
    timestamps: true, // Includes createdAt and updatedAt
  }
);

// Middleware to format fields before saving the agent
agentSchema.pre('save', async function (next) {
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
agentSchema.pre('save', async function (next) {
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
agentSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT token
agentSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '7h' });
};

module.exports = mongoose.model('Agent', agentSchema);
