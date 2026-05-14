const express = require('express');
const SensorEvent = require('../models/SensorEvent');
const Ticket = require('../models/Ticket');

const router = express.Router();

function generateToken() {
  return `T${Math.floor(100000 + Math.random() * 900000)}`;
}

router.post('/entry', async (req, res) => {
  try {
    const { vehiclePlate, sensorId, location } = req.body;
    if (!vehiclePlate || !sensorId || !location) {
      return res.status(400).json({ message: 'vehiclePlate, sensorId, and location are required.' });
    }

    const existing = await Ticket.findOne({ vehiclePlate: vehiclePlate.trim(), status: 'ACTIVE' });
    if (existing) {
      return res.status(409).json({ message: 'There is already an active ticket for this vehicle.' });
    }

    const token = generateToken();
    const entryTime = new Date();

    const ticket = await Ticket.create({
      token,
      vehiclePlate: vehiclePlate.trim(),
      sensorId: sensorId.trim(),
      location: location.trim(),
      entryTime,
    });

    await SensorEvent.create({
      sensorId: sensorId.trim(),
      location: location.trim(),
      vehiclePlate: vehiclePlate.trim(),
      type: 'ARRIVAL',
      ts: entryTime,
      occupiedAfter: true,
    });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create entry ticket', error: String(err?.message || err) });
  }
});

router.post('/exit', async (req, res) => {
  try {
    const { token, sensorId, location } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'token is required.' });
    }

    const ticket = await Ticket.findOne({ token: token.trim(), status: 'ACTIVE' });
    if (!ticket) {
      return res.status(404).json({ message: 'Active ticket not found for this token.' });
    }

    const exitTime = new Date();
    const durationMinutes = Math.max(1, Math.round((exitTime - ticket.entryTime) / 60000));
    const ratePerHour = 40;
    const fee = Math.round((durationMinutes / 60) * ratePerHour * 100) / 100;

    ticket.exitTime = exitTime;
    ticket.exitSensorId = sensorId?.trim() || ticket.sensorId;
    ticket.exitLocation = location?.trim() || ticket.location;
    ticket.durationMinutes = durationMinutes;
    ticket.fee = fee;
    ticket.status = 'CLOSED';
    await ticket.save();

    await SensorEvent.create({
      sensorId: ticket.exitSensorId,
      location: ticket.exitLocation,
      vehiclePlate: ticket.vehiclePlate,
      type: 'DEPARTURE',
      ts: exitTime,
      occupiedAfter: false,
    });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Failed to close ticket', error: String(err?.message || err) });
  }
});

router.get('/tickets', async (req, res) => {
  try {
    const { active, status, plate, token } = req.query;
    const filter = {};

    if (status === 'ACTIVE' || active === 'true') {
      filter.status = 'ACTIVE';
    } else if (status === 'CLOSED' || active === 'false') {
      filter.status = 'CLOSED';
    }

    if (plate) {
      filter.vehiclePlate = new RegExp(plate.trim(), 'i');
    }

    if (token) {
      filter.token = token.trim();
    }

    const tickets = await Ticket.find(filter).sort({ entryTime: -1 }).limit(200);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tickets', error: String(err?.message || err) });
  }
});

module.exports = router;
