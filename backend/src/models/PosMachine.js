const mongoose = require('mongoose');

const posMachineSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true }, // Unique ID for the POS
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }, // Status of the POS machine
  linkedCar: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // Reference to the Car model
  assignedDate: { type: Date }, // Date the POS was assigned to a car
  lastActivityDate: { type: Date }, // For tracking usage or last operation
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// Transform the `_id` to `id`
posMachineSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('PosMachine', posMachineSchema);
