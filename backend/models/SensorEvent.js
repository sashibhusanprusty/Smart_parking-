const mongoose = require('mongoose');

const SensorEventSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    vehiclePlate: { type: String, default: null },

    // Event types: ARRIVAL | DEPARTURE
    type: { type: String, enum: ['ARRIVAL', 'DEPARTURE'], required: true, index: true },

    // time of event
    ts: { type: Date, required: true, index: true },

    // Occupancy support: whether the spot is occupied after event
    // (for simplicity we derive occupancy from paired events, but having a field helps debugging)
    occupiedAfter: { type: Boolean, default: false },
  },
  { timestamps: false }
);

module.exports = mongoose.model('SensorEvent', SensorEventSchema);

