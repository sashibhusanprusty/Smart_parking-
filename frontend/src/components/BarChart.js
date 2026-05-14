import React from 'react';

function BarChart({ title, categories = [], bars = [], height = 220 }) {
  // bars: [{ label, values: number[] , color }]
  const width = 720;
  const padding = 40;

  const allValues = bars.flatMap((b) => b.values || []);
  const max = Math.max(...allValues, 1);

  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const groupCount = categories.length || 1;
  const groupW = chartW / groupCount;
  const innerGap = 6;
  const barCount = Math.max(1, bars.length);
  const barW = (groupW - innerGap * (barCount - 1)) / barCount;

  return (
    <div className="chartCard">
      <div className="chartTitle">{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chartSvg" preserveAspectRatio="none">
        {/* axis/grid */}
        {Array.from({ length: 4 }).map((_, i) => {
          const v = (max * (i + 1)) / 4;
          const y = padding + chartH - (v / max) * chartH;
          return <line key={i} x1={padding} x2={width - padding} y1={y} y2={y} className="chartGrid" />;
        })}

        {categories.map((cat, i) => {
          return bars.map((b, bi) => {
            const v = b.values?.[i] ?? 0;
            const h = (v / max) * chartH;
            const x = padding + i * groupW + bi * (barW + innerGap);
            const y = padding + (chartH - h);
            return (
              <rect
                key={`${i}-${bi}`}
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={4}
                fill={b.color}
                opacity={0.92}
              />
            );
          });
        })}
      </svg>

      <div className="chartLegend">
        {bars.map((b) => (
          <div key={b.label} className="legendItem">
            <span className="legendSwatch" style={{ background: b.color }} />
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BarChart;

