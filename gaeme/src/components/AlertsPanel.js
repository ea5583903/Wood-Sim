import React from 'react';

function AlertsPanel({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="alerts-panel">
      <h4>Alerts</h4>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={index} className={`alert alert-${alert.type}`}>
            <span className="alert-message">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AlertsPanel;