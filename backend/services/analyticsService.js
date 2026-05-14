const SensorEvent = require('../models/SensorEvent');

function parseDate(input, fallback) {
  if (!input) return fallback;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function getSummary({ from, to }) {
  const now = new Date();
  const fromD = startOfDay(parseDate(from, new Date(now.getTime() - 6 * 864e5)));
  const toD = endOfDay(parseDate(to, now));

  const match = { ts: { $gte: fromD, $lte: toD } };

  const [arrivals, departures, eventsCount] = await Promise.all([
    SensorEvent.countDocuments({ ...match, type: 'ARRIVAL' }),
    SensorEvent.countDocuments({ ...match, type: 'DEPARTURE' }),
    SensorEvent.countDocuments(match),
  ]);

  // Occupancy approximation: build per-hour occupancy from arrivals/departures.
  // For dashboard demo: occupancy % = activeVehicles / totalSensors.
  const occupancy = await getOccupancySeries({ from: toISODate(fromD), to: toISODate(toD), bucket: 'hour' });
  const avgOcc = occupancy?.data?.length
    ? occupancy.data.reduce((s, p) => s + p.value, 0) / occupancy.data.length
    : 0;

  return {
    from: toISODate(fromD),
    to: toISODate(toD),
    totalEvents: eventsCount,
    arrivals,
    departures,
    avgOccupancyPercent: Math.round(avgOcc * 10) / 10,
    // Avg duration approximation using paired events by sensor (simple heuristic)
    avgParkingMinutes: await getAvgParkingMinutes({ from: fromD, to: toD }),
  };
}

async function getAvgParkingMinutes({ from, to }) {
  // Pull only events in range; for demo, pair sequential ARRIVAL->DEPARTURE per sensor.
  const events = await SensorEvent.find({ ts: { $gte: from, $lte: to } })
    .sort({ sensorId: 1, ts: 1 })
    .select('sensorId type ts')
    .lean();

  const openBySensor = new Map();
  const durations = [];

  for (const e of events) {
    if (e.type === 'ARRIVAL') {
      openBySensor.set(e.sensorId, e.ts);
    } else if (e.type === 'DEPARTURE') {
      const start = openBySensor.get(e.sensorId);
      if (start) {
        durations.push((e.ts - start) / 60000);
        openBySensor.delete(e.sensorId);
      }
    }
  }

  if (!durations.length) return 0;
  const avg = durations.reduce((s, v) => s + v, 0) / durations.length;
  return Math.round(avg * 10) / 10;
}

async function getOccupancySeries({ from, to, bucket = 'hour' }) {
  const now = new Date();
  const fromD = startOfDay(parseDate(from, new Date(now.getTime() - 6 * 864e5)));
  const toD = endOfDay(parseDate(to, now));

  const totalSensors = await SensorEvent.distinct('sensorId', {
    ts: { $gte: fromD, $lte: toD },
  });

  const sensorCount = Math.max(1, totalSensors.length);

  const events = await SensorEvent.find({ ts: { $gte: fromD, $lte: toD }, type: { $in: ['ARRIVAL', 'DEPARTURE'] } })
    .sort({ ts: 1 })
    .select('sensorId type ts')
    .lean();

  // Build time buckets
  const stepMs = bucket === 'day' ? 864e5 : 3600e3;
  const points = [];

  let t = new Date(fromD);
  const active = new Set();

  // Pre-index events per bucket boundary by iterating sequentially
  let idx = 0;

  while (t <= toD) {
    const nextT = new Date(t.getTime() + stepMs);

    // Advance active set for events up to nextT
    while (idx < events.length && events[idx].ts <= nextT) {
      const e = events[idx];
      if (e.type === 'ARRIVAL') active.add(e.sensorId);
      if (e.type === 'DEPARTURE') active.delete(e.sensorId);
      idx++;
    }

    const value = (active.size / sensorCount) * 100;
    points.push({ ts: t.toISOString(), value: Math.round(value * 10) / 10 });

    t = nextT;
  }

  return {
    from: fromD.toISOString(),
    to: toD.toISOString(),
    unit: '%',
    data: points,
  };
}

async function getEventsSeries({ from, to }) {
  const now = new Date();
  const fromD = startOfDay(parseDate(from, new Date(now.getTime() - 6 * 864e5)));
  const toD = endOfDay(parseDate(to, now));

  const stepMs = 3600e3;
  const points = [];

  const events = await SensorEvent.find({ ts: { $gte: fromD, $lte: toD }, type: { $in: ['ARRIVAL', 'DEPARTURE'] } })
    .sort({ ts: 1 })
    .select('type ts')
    .lean();

  // Bucket counts per hour
  let t = new Date(fromD);
  let idx = 0;

  while (t <= toD) {
    const nextT = new Date(t.getTime() + stepMs);
    let a = 0;
    let d = 0;

    while (idx < events.length && events[idx].ts <= nextT) {
      if (events[idx].type === 'ARRIVAL') a++;
      if (events[idx].type === 'DEPARTURE') d++;
      idx++;
    }

    points.push({ ts: t.toISOString(), arrivals: a, departures: d });
    t = nextT;
  }

  return { from: fromD.toISOString(), to: toD.toISOString(), data: points };
}

module.exports = {
  getSummary,
  getOccupancySeries,
  getEventsSeries,
};

