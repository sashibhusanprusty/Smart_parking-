const SensorEvent = require('../models/SensorEvent');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function daysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(0, 23), randInt(0, 59), 0, 0);
  return d;
}

async function seedSampleEvents() {
  // Seed last 7 days only if collection is empty-ish
  const existing = await SensorEvent.estimatedDocumentCount();
  if (existing > 50) return;

  const locations = ['Gate-A', 'Gate-B', 'Sector-1', 'Sector-2', 'Sector-3'];
  const sensors = ['SPOT-101', 'SPOT-102', 'SPOT-201', 'SPOT-202', 'SPOT-301', 'SPOT-302'];
  const plates = ['KA-01-AB-1234', 'MH-12-CD-4567', 'DL-03-EF-8901', 'TN-09-GH-2345'];

  const batch = [];

  for (let day = 0; day < 7; day++) {
    const baseCount = randInt(40, 80);

    for (let i = 0; i < baseCount; i++) {
      const sensorId = pick(sensors);
      const location = pick(locations);
      const startTs = daysAgoDate(day);

      // Create arrival
      batch.push({
        sensorId,
        location,
        vehiclePlate: pick(plates),
        type: 'ARRIVAL',
        ts: startTs,
        occupiedAfter: true,
      });

      // Create departure 5-90 minutes later sometimes
      const hasDeparture = Math.random() > 0.08;
      if (hasDeparture) {
        const departTs = new Date(startTs.getTime() + randInt(5, 90) * 60 * 1000);
        batch.push({
          sensorId,
          location,
          vehiclePlate: pick(plates),
          type: 'DEPARTURE',
          ts: departTs,
          occupiedAfter: false,
        });
      }
    }
  }

  await SensorEvent.insertMany(batch);
}

module.exports = seedSampleEvents;

