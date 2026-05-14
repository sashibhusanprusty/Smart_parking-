import React, { useEffect, useState } from 'react';
import TicketCard from './TicketCard';

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const opts = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
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

export default function ParkingControlPanel() {
  const [vehiclePlate, setVehiclePlate] = useState('KA-01-AB-1234');
  const [sensorId, setSensorId] = useState('SPOT-101');
  const [location, setLocation] = useState('Main Gate');
  const [token, setToken] = useState('');
  const [activeTickets, setActiveTickets] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchActiveTickets = async () => {
    try {
      const tickets = await apiRequest('/api/parking/tickets?active=true');
      setActiveTickets(tickets);
    } catch (err) {
      setError('Unable to load active tickets.');
    }
  };

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  const handleEntry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const ticket = await apiRequest('/api/parking/entry', {
        method: 'POST',
        body: { vehiclePlate, sensorId, location },
      });
      setToken(ticket.token);
      setStatusMessage(`Entry recorded. Ticket ${ticket.token} generated.`);
      setVehiclePlate('');
      await fetchActiveTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatusMessage(null);
    try {
      const ticket = await apiRequest('/api/parking/exit', {
        method: 'POST',
        body: { token, sensorId, location },
      });
      setStatusMessage(`Exit registered. Fee ₹${ticket.fee} for ${ticket.durationMinutes} min.`);
      setToken('');
      await fetchActiveTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parkingPanel">
      <div className="panelHeader">
        <div>
          <div className="panelTitle">Vehicle Entry / Exit</div>
          <div className="panelSubtitle">Create tickets and manage vehicle movements in real time.</div>
        </div>
      </div>

      <div className="panelContent">
        <form className="parkingForm" onSubmit={handleEntry}>
          <div className="formGroup">
            <label>Registration Number</label>
            <input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="KA-01-AB-1234" />
          </div>
          <div className="formGroup">
            <label>Parking Spot / Sensor</label>
            <input value={sensorId} onChange={(e) => setSensorId(e.target.value)} placeholder="SPOT-101" />
          </div>
          <div className="formGroup">
            <label>Location / Gate</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Main Gate" />
          </div>
          <div className="actionRow">
            <button type="submit" className="primaryButton" disabled={loading}>Create Ticket</button>
            <button type="button" className="secondaryButton" onClick={handleExit} disabled={loading || !token}>Close Ticket</button>
          </div>
          <div className="formGroup fullWidth">
            <label>Ticket Token</label>
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Enter ticket token for exit" />
          </div>
        </form>

        <div className="parkingStatus">
          {statusMessage ? <div className="successBox">{statusMessage}</div> : null}
          {error ? <div className="errorBox">{error}</div> : null}
          <div className="ticketCount">Active tickets: {activeTickets.length}</div>
          <div className="ticketList">
            {activeTickets.slice(0, 6).map((ticket) => (
              <TicketCard key={ticket.token} ticket={ticket} />
            ))}
            {!activeTickets.length ? <div className="emptyState">No active tickets yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
