import React, { useEffect, useState } from 'react';

const allSpots = Array.from({ length: 16 }, (_, index) => `SPOT-${100 + index}`);
const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export default function ParkingMapPanel() {
  const [activeTickets, setActiveTickets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const tickets = await apiRequest('/api/parking/tickets?active=true');
        setActiveTickets(tickets);
      } catch (err) {
        setError('Unable to fetch occupancy map');
      }
    }
    load();
  }, []);

  const occupiedSpots = new Set(activeTickets.map((ticket) => ticket.sensorId));

  return (
    <div className="mapPanel">
      {error ? <div className="errorBox">{error}</div> : null}
      <div className="panelHeader">
        <div>
          <div className="panelTitle">Parking Occupancy Map</div>
          <div className="panelSubtitle">Live spot availability based on active tickets.</div>
        </div>
      </div>

      <div className="spotGrid">
        {allSpots.map((spot) => {
          const occupied = occupiedSpots.has(spot);
          return (
            <div key={spot} className={`spotCard ${occupied ? 'occupied' : 'available'}`}>
              <div className="spotLabel">{spot}</div>
              <div className="spotStatus">{occupied ? 'Occupied' : 'Available'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
