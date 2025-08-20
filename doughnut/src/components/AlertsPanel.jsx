import React from 'react';

function AlertsPanel({ alerts }) {
  const getAlertIcon = (type) => {
    const icons = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getAlertClass = (type) => {
    return `alert alert-${type}`;
  };

  return (
    <div className="panel">
      <div className="panel-header">
        📢 Game Alerts
      </div>
      <div className="panel-content">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <p className="text-muted">No recent alerts</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className={getAlertClass(alert.type)}>
                <div className="alert-content">
                  <span className="alert-icon">
                    {getAlertIcon(alert.type)}
                  </span>
                  <span className="alert-message">
                    {alert.message}
                  </span>
                </div>
                <div className="alert-time">
                  {alert.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;