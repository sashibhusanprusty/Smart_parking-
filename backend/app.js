require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const analyticsRoutes = require('./routes/analytics');
const seedSampleEvents = require('./services/seedSampleEvents');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/analytics', analyticsRoutes);

async function start() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_parking';

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  await seedSampleEvents();
}

start()
  .then(() => {
    // server.js handles listening
  })
  .catch((err) => {
    console.error('Failed to start backend:', err);
    process.exit(1);
  });

module.exports = app;

