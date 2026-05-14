import React, { useEffect, useMemo, useState } from 'react';
import KpiCard from './KpiCard';
import LineChart from './LineChart';
import BarChart from './BarChart';

const todayISO = () => new Date().toISOString().slice(0, 10);
const defaultFromISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
};

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function formatDateLabel(isoTs) {
  const d = new Date(isoTs);
  return `${d.getHours().toString().padStart(2, '0')}:00`;
}

export default function AnalyticsDashboard() {
  const [from, setFrom] = useState(defaultFromISO());
  const [to, setTo] = useState(todayISO());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [occupancy, setOccupancy] = useState(null);
  const [events, setEvents] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ from, to });
    return params.toString();
  }, [from, to]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, o, e] = await Promise.all([
          apiGet(`/api/analytics/summary?${query}`),
          apiGet(`/api/analytics/occupancy?${query}`),
          apiGet(`/api/analytics/events?${query}`),
        ]);
        if (!mounted) return;
        setSummary(s);
        setOccupancy(o);
        setEvents(e);
      } catch (err) {
        if (!mounted) return;
        setError(String(err?.message || err));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [query]);

  const occupancyLabels = occupancy?.data?.slice(-24).map((p) => formatDateLabel(p.ts)) || [];
  const occupancyValues = occupancy?.data?.slice(-24).map((p) => p.value) || [];

  const eventsLabels = events?.data?.slice(-24).map((p) => formatDateLabel(p.ts)) || [];
  const arrivals = events?.data?.slice(-24).map((p) => p.arrivals) || [];
  const departures = events?.data?.slice(-24).map((p) => p.departures) || [];

  return (
    <div className="page">
      <div className="topBar">
        <div>
          <div className="title">Smart Parking Analytics</div>
          <div className="subtitle">Live analytics dashboard from MongoDB sensor events</div>
        </div>

        <div className="filters">
          <label className="filter">
            From
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="filter">
            To
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      </div>

      {error ? <div className="errorBox">{error}</div> : null}
      {loading && !error ? <div className="loading">Loading analytics...</div> : null}

      <div className="kpiGrid">
        <KpiCard label="Avg Occupancy" value={`${summary?.avgOccupancyPercent ?? 0}%`} subValue={`${summary?.from ?? ''} → ${summary?.to ?? ''}`} />
        <KpiCard label="Total Events" value={summary?.totalEvents ?? 0} subValue="arrivals + departures" />
        <KpiCard label="Arrivals" value={summary?.arrivals ?? 0} subValue="vehicles entered" />
        <KpiCard label="Avg Parking Time" value={`${summary?.avgParkingMinutes ?? 0} min`} subValue="heuristic from sensor pairs" />
      </div>

      <div className="grid2">
        <LineChart title="Occupancy over time (last 24 hours)" labels={occupancyLabels} series={[occupancyValues]} />
        <BarChart
          title="Arrivals vs Departures (last 24 hours)"
          categories={eventsLabels}
          bars={[
            { label: 'Arrivals', values: arrivals, color: '#3b82f6' },
            { label: 'Departures', values: departures, color: '#22c55e' },
          ]}
        />
      </div>

      <div className="footNote">
        If MongoDB is empty, backend auto-seeds sample events so this dashboard works immediately.
      </div>
    </div>
  );
}

