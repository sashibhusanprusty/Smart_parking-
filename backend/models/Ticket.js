const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    vehiclePlate: { type: String, required: true, trim: true },
    sensorId: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    entryTime: { type: Date, required: true, default: Date.now },
    exitTime: { type: Date, default: null },
    exitSensorId: { type: String, trim: true, default: null },
    exitLocation: { type: String, trim: true, default: null },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE', index: true },
    durationMinutes: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
