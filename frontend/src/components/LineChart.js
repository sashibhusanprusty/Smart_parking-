import React from 'react';

function LineChart({ title, labels = [], series = [], height = 240 }) {
  // Simple SVG line chart (no external chart libs)
  const width = 720;
  const padding = 40;

  const values = series.flat();
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;

  const xFor = (i) => {
    if (labels.length <= 1) return padding;
    return padding + (i * (width - padding * 2)) / (labels.length - 1);
  };

  const yFor = (v) => {
    const t = (v - min) / span;
    return height - padding - t * (height - padding * 2);
  };

  const gridLines = 4;
  const grid = Array.from({ length: gridLines + 1 }).map((_, i) => {
    const v = min + (span * i) / gridLines;
    return { y: yFor(v), v };
  });

  return (
    <div className="chartCard">
      <div className="chartTitle">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chartSvg" preserveAspectRatio="none">
        {grid.map((g, idx) => (
          <g key={idx}>
            <line x1={padding} x2={width - padding} y1={g.y} y2={g.y} className="chartGrid" />
            <text x={8} y={g.y + 4} className="chartAxisText">{Math.round(g.v)}</text>
          </g>
        ))}

        {series.map((arr, sIdx) => {
          const points = arr.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ');
          const color = ['#3b82f6', '#22c55e'][sIdx % 2];
          return (
            <g key={sIdx}>
              <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default LineChart;

