import React, { useCallback, useEffect, useState } from 'react';
import TicketCard from './TicketCard';

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

export default function TicketHistoryPanel() {
  const [status, setStatus] = useState('ACTIVE');
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ status, plate: search.trim() }).toString();
      const data = await apiRequest(`/api/parking/tickets?${query}`);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <div className="historyPanel">
      <div className="panelHeader historyHeader">
        <div>
          <div className="panelTitle">Ticket History</div>
          <div className="panelSubtitle">Search active or closed tickets by plate number.</div>
        </div>

        <div className="historyControls">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="ALL">All</option>
          </select>
          <input
            type="text"
            placeholder="Search plate"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="secondaryButton" onClick={loadTickets} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="errorBox">{error}</div> : null}
      <div className="ticketHistoryGrid">
        {tickets.length > 0 ? (
          tickets.map((ticket) => <TicketCard key={ticket.token} ticket={ticket} />)
        ) : (
          <div className="emptyState">No tickets found for this query.</div>
        )}
      </div>
    </div>
  );
}
