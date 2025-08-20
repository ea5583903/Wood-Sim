import React from 'react';

function CustomerQueue({ customers, gameEngine }) {
  const getCustomerIcon = (type) => {
    const icons = {
      'Casual': '👤',
      'Business': '💼',
      'Student': '🎓',
      'Tourist': '📷',
      'Regular': '⭐'
    };
    return icons[type] || '👤';
  };

  const getPatienceColor = (percentage) => {
    if (percentage > 60) return '#059669';
    if (percentage > 30) return '#d97706';
    return '#dc2626';
  };

  const canServeCustomer = (customer) => {
    return gameEngine.gameState.shop.canServe(customer.order);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        👥 Customer Queue ({customers.length}/8)
      </div>
      <div className="panel-content">
        {customers.length === 0 ? (
          <div className="empty-state">
            <p className="text-muted">No customers waiting</p>
          </div>
        ) : (
          <div className="customer-list">
            {customers.map((customer, index) => (
              <div 
                key={customer.id} 
                className={`customer-card ${index === 0 ? 'next-customer' : ''} ${!canServeCustomer(customer) ? 'cannot-serve' : ''}`}
              >
                <div className="customer-info">
                  <div className="customer-header">
                    <span className="customer-icon">
                      {getCustomerIcon(customer.type)}
                    </span>
                    <span className="customer-type">{customer.type}</span>
                    {index === 0 && <span className="next-badge">NEXT</span>}
                  </div>
                  
                  <div className="customer-order">
                    <strong>Order:</strong>
                    <div className="order-items">
                      {customer.order.map((item, i) => (
                        <span key={i} className="order-item">
                          🍩 {item}
                        </span>
                      ))}
                    </div>
                    <div className="order-value">
                      ${customer.orderValue.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="patience-bar">
                    <div className="patience-label">
                      Patience: {customer.patience}s
                    </div>
                    <div className="patience-progress">
                      <div 
                        className="patience-fill"
                        style={{ 
                          width: `${customer.getPatiencePercentage()}%`,
                          backgroundColor: getPatienceColor(customer.getPatiencePercentage())
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerQueue;