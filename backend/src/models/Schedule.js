// models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  origin: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  time: { type: Date, required: true },
  originType: { type: String },
  destinationType: { type: String },
  matchedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  constructedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  status: {
    type: String,
    enum: ['pending', 'active', 'cancelled', 'expired'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Transform _id to id
scheduleSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
