import React from 'react';

function Sparkline({ data, width = 80, height = 30 }) {
  if (!data || data.length < 2) {
    return <div className="sparkline-empty" style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // Avoid division by zero

  // Create SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // const pathD = `M ${points}`; // Could be used for path element if needed

  // Determine color based on trend
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const trend = lastValue >= firstValue ? 'positive' : 'negative';

  return (
    <div className="sparkline-container" style={{ width, height }}>
      <svg width={width} height={height} className={`sparkline sparkline-${trend}`}>
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Optional: Add a dot for the latest point */}
        <circle
          cx={((data.length - 1) / (data.length - 1)) * width}
          cy={height - ((lastValue - min) / range) * height}
          r="1.5"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export default Sparkline;