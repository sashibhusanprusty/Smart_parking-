import React from 'react';

function KpiCard({ label, value, subValue }) {
  return (
    <div className="kpiCard">
      <div className="kpiLabel">{label}</div>
      <div className="kpiValue">{value}</div>
      {subValue ? <div className="kpiSub">{subValue}</div> : null}
    </div>
  );
}

export default KpiCard;

