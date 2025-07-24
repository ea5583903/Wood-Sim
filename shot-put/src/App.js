import React, { useState, useRef } from 'react';
import './App.css';

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function App() {
  const [shotPut, setShotPut] = useState({ x: 50, y: 350, vx: 0, vy: 0, flying: false });
  const [message, setMessage] = useState('');
  const [canShoot, setCanShoot] = useState(false);
  const [lastLaunch, setLastLaunch] = useState({ angle: null, power: null });
  const [leaderboard, setLeaderboard] = useState([]); // {distance, angle, power}
  const animationRef = useRef();

  // Launch the shot-put with random power and angle (wider range for more variety)
  const launchShotPut = () => {
    setMessage('');
    setCanShoot(true);
    const power = getRandom(40, 120); // 40-120 px/s, more variety
    const angleDeg = getRandom(20, 70); // 20-70 degrees, more variety
    const angle = angleDeg * (Math.PI / 180);
    const vx = power * Math.cos(angle);
    const vy = -power * Math.sin(angle);
    setShotPut({ x: 50, y: 350, vx, vy, flying: true });
    setLastLaunch({ angle: angleDeg.toFixed(1), power: power.toFixed(1) });
    requestAnimationFrame(() => animateShotPut({ x: 50, y: 350, vx, vy, flying: true }, Date.now()));
  };

  // Animate the shot-put's flight
  const animateShotPut = (state, lastTime) => {
    if (!state.flying) return;
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    let { x, y, vx, vy } = state;
    const g = 30; // gravity, px/s^2
    vy += g * dt;
    x += vx * dt;
    y += vy * dt;
    if (y > 350) {
      y = 350;
      setShotPut({ x, y, vx: 0, vy: 0, flying: false });
      setCanShoot(false);
      setMessage('Missed! Try again.');
      return;
    }
    setShotPut({ x, y, vx, vy, flying: true });
    animationRef.current = requestAnimationFrame(() => animateShotPut({ x, y, vx, vy, flying: true }, now));
  };

  // Handle shooting
  const handleShoot = (e) => {
    if (!canShoot || !shotPut.flying) return;
    // Get click position relative to SVG
    const svg = e.target.ownerSVGElement || e.target;
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    // Check if click is within shot-put (radius 15)
    const dx = clickX - shotPut.x;
    const dy = clickY - shotPut.y;
    if (dx * dx + dy * dy <= 15 * 15) {
      setMessage('🎯 Hit!');
      setCanShoot(false);
      setShotPut(s => ({ ...s, flying: false }));
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // Calculate distance from launch point (50, 350) to hit point
      const distance = getDistance(50, 350, shotPut.x, shotPut.y).toFixed(1);
      // Add to leaderboard
      setLeaderboard(prev => {
        const newEntry = {
          distance: Number(distance),
          angle: lastLaunch.angle,
          power: lastLaunch.power,
        };
        const updated = [...prev, newEntry]
          .sort((a, b) => b.distance - a.distance)
          .slice(0, 5); // keep top 5
        return updated;
      });
    } else {
      setMessage('Miss!');
    }
  };

  // Reset for another round
  const handleReset = () => {
    setMessage('');
    setShotPut({ x: 50, y: 350, vx: 0, vy: 0, flying: false });
    setCanShoot(false);
    setLastLaunch({ angle: null, power: null });
  };

  return (
    <div className="App" style={{ padding: 32, maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🏅 Shot-Put Shooting Game</h1>
      <p>Click "Launch" to throw the shot-put. Try to shoot it by clicking on it as it flies!</p>
      <button onClick={launchShotPut} disabled={shotPut.flying} style={{ padding: '12px 32px', fontSize: 18, cursor: shotPut.flying ? 'not-allowed' : 'pointer' }}>
        Launch
      </button>
      <button onClick={handleReset} style={{ marginLeft: 16, padding: '12px 32px', fontSize: 18 }}>
        Reset
      </button>
      <div style={{ marginTop: 16, color: '#1565c0', fontWeight: 'bold', fontSize: 18 }}>
        {lastLaunch.angle && lastLaunch.power && (
          <span>Angle: {lastLaunch.angle}° &nbsp;|&nbsp; Power: {lastLaunch.power}</span>
        )}
      </div>
      <div style={{ marginTop: 32, border: '2px solid #333', borderRadius: 8, background: '#e0f7fa', width: 500, height: 400, position: 'relative' }}>
        <svg width={500} height={400} style={{ display: 'block' }} onClick={handleShoot}>
          {/* Ground */}
          <rect x={0} y={365} width={500} height={35} fill="#8bc34a" />
          {/* Shot-put */}
          <circle cx={shotPut.x} cy={shotPut.y} r={15} fill="#888" stroke="#333" strokeWidth={3} />
        </svg>
        {message && (
          <div style={{ position: 'absolute', top: 10, left: 10, fontSize: 24, color: message.includes('Hit') ? 'green' : 'red' }}>
            {message}
          </div>
        )}
      </div>
      <div style={{ marginTop: 16, color: '#888' }}>
        {shotPut.flying ? 'Shot-put is in the air! Click to shoot!' : 'Ready to launch.'}
      </div>
      {/* Leaderboard */}
      <div style={{ marginTop: 40, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #1565c022', padding: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 style={{ color: '#1565c0', marginBottom: 12 }}>🏆 Leaderboard</h2>
        {leaderboard.length === 0 ? (
          <div style={{ color: '#888' }}>No hits yet. Try to get on the board!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17 }}>
            <thead>
              <tr style={{ color: '#1565c0', borderBottom: '2px solid #b3e5fc' }}>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>#</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Distance</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Angle</th>
                <th style={{ textAlign: 'left', padding: '4px 8px' }}>Power</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={i} style={{ background: i === 0 ? '#e3f2fd' : 'none' }}>
                  <td style={{ padding: '4px 8px' }}>{i + 1}</td>
                  <td style={{ padding: '4px 8px' }}>{entry.distance} px</td>
                  <td style={{ padding: '4px 8px' }}>{entry.angle}°</td>
                  <td style={{ padding: '4px 8px' }}>{entry.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;
