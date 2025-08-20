import React from 'react';

function StatusBar({ shop, currentDay, currentTick, stats }) {
  const ticksPerDay = 60;
  const dayProgress = (currentTick / ticksPerDay) * 100;
  
  const satisfactionRate = stats.totalCustomers > 0 
    ? ((stats.satisfiedCustomers / stats.totalCustomers) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-value">${shop.cash.toFixed(2)}</span>
        <span className="status-label">Cash</span>
      </div>
      
      <div className="status-item">
        <span className="status-value">{shop.reputation}%</span>
        <span className="status-label">Reputation</span>
      </div>
      
      <div className="status-item">
        <span className="status-value">{stats.satisfiedCustomers}</span>
        <span className="status-label">Served</span>
      </div>
      
      <div className="status-item">
        <span className="status-value">{stats.lostCustomers}</span>
        <span className="status-label">Lost</span>
      </div>
      
      <div className="status-item">
        <span className="status-value">{satisfactionRate}%</span>
        <span className="status-label">Success Rate</span>
      </div>
      
      <div className="status-item day-progress">
        <span className="status-value">Day {currentDay}</span>
        <span className="status-label">Tick {currentTick}/{ticksPerDay}</span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${dayProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default StatusBar;