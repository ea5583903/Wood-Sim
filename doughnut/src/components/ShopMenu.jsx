import React, { useState } from 'react';

function ShopMenu({ shop, gameEngine }) {
  const [editingPrices, setEditingPrices] = useState({});

  const doughnutIcons = {
    'Plain': '🍩',
    'Chocolate': '🍫',
    'Strawberry': '🍓',
    'Boston Cream': '🍰',
    'Jelly-Filled': '🍯'
  };

  const handlePriceChange = (recipe, newPrice) => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 1.00 && price <= 10.00) {
      gameEngine.setPrice(recipe, price);
    }
  };

  const startEditingPrice = (recipe) => {
    setEditingPrices({
      ...editingPrices,
      [recipe]: shop.prices[recipe].toFixed(2)
    });
  };

  const stopEditingPrice = (recipe) => {
    const newPrice = editingPrices[recipe];
    if (newPrice !== undefined) {
      handlePriceChange(recipe, newPrice);
    }
    const updated = { ...editingPrices };
    delete updated[recipe];
    setEditingPrices(updated);
  };

  const updateEditingPrice = (recipe, value) => {
    setEditingPrices({
      ...editingPrices,
      [recipe]: value
    });
  };

  return (
    <div className="panel">
      <div className="panel-header">
        🏪 Shop Menu & Pricing
      </div>
      <div className="panel-content">
        <div className="menu-grid">
          {Object.entries(shop.doughnuts).map(([recipe, stock]) => (
            <div key={recipe} className="menu-item">
              <div className="menu-item-header">
                <span className="menu-icon">
                  {doughnutIcons[recipe]}
                </span>
                <span className="menu-name">{recipe}</span>
                <span className={`stock-badge ${stock === 0 ? 'out-of-stock' : stock < 3 ? 'low-stock' : ''}`}>
                  {stock}
                </span>
              </div>
              
              <div className="price-control">
                {editingPrices[recipe] !== undefined ? (
                  <div className="price-edit">
                    <input
                      type="number"
                      min="1.00"
                      max="10.00"
                      step="0.25"
                      value={editingPrices[recipe]}
                      onChange={(e) => updateEditingPrice(recipe, e.target.value)}
                      onBlur={() => stopEditingPrice(recipe)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          stopEditingPrice(recipe);
                        }
                        if (e.key === 'Escape') {
                          const updated = { ...editingPrices };
                          delete updated[recipe];
                          setEditingPrices(updated);
                        }
                      }}
                      autoFocus
                      className="price-input"
                    />
                  </div>
                ) : (
                  <button
                    className="price-display"
                    onClick={() => startEditingPrice(recipe)}
                    title="Click to edit price"
                  >
                    ${shop.prices[recipe].toFixed(2)}
                  </button>
                )}
              </div>
              
              <div className="menu-item-actions">
                <button
                  className="btn btn-success btn-small"
                  onClick={() => gameEngine.makeDoughnut(recipe, 1)}
                  disabled={!shop.canMake(recipe, 1)}
                  title={!shop.canMake(recipe, 1) ? 'Missing ingredients' : 'Make 1 doughnut'}
                >
                  Make 1
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => gameEngine.makeDoughnut(recipe, 5)}
                  disabled={!shop.canMake(recipe, 5)}
                  title={!shop.canMake(recipe, 5) ? 'Missing ingredients' : 'Make 5 doughnuts'}
                >
                  Make 5
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="menu-summary">
          <div className="summary-item">
            <strong>Total Stock:</strong> {Object.values(shop.doughnuts).reduce((a, b) => a + b, 0)} doughnuts
          </div>
          <div className="summary-item">
            <strong>Menu Value:</strong> ${Object.entries(shop.doughnuts).reduce((total, [recipe, stock]) => {
              return total + (stock * shop.prices[recipe]);
            }, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopMenu;