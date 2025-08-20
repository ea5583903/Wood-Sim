import React from 'react';

function OrderHistory({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="order-history">
        <h3>Order History</h3>
        <p className="empty-state">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <h3>Order History</h3>
      <div className="orders-list">
        {orders.map((order, index) => (
          <div key={index} className={`order-item order-${order.type}`}>
            <div className="order-header">
              <span className={`order-type ${order.type}`}>
                {order.type.toUpperCase()}
              </span>
              <span className="order-time">{order.timestamp}</span>
            </div>
            <div className="order-details">
              <div className="order-good">
                {order.quantity} × {order.goodName}
              </div>
              <div className="order-price">
                @ ${order.price}
              </div>
              <div className="order-total">
                Total: ${(parseFloat(order.price) * order.quantity).toFixed(2)}
              </div>
              <div className="order-fees">
                Fees: ${order.fees}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;