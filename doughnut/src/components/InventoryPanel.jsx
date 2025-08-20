import React from 'react';

function InventoryPanel({ shop, gameEngine }) {
  const ingredientIcons = {
    'Dough': '🥖',
    'Sugar': '🍯',
    'Chocolate': '🍫',
    'Strawberry': '🍓',
    'Cream': '🥛',
    'Jelly': '🍇'
  };

  const ingredientCosts = {
    'Dough': 0.50,
    'Sugar': 0.30,
    'Chocolate': 1.00,
    'Strawberry': 1.00,
    'Cream': 1.20,
    'Jelly': 0.80
  };

  const getStockLevel = (current, ingredient) => {
    if (current === 0) return 'out';
    if (current <= 5) return 'low';
    if (current <= 15) return 'medium';
    return 'high';
  };

  const canAfford = (ingredient, quantity) => {
    const cost = ingredientCosts[ingredient] * quantity;
    return shop.cash >= cost;
  };

  const restockIngredient = (ingredient, quantity) => {
    gameEngine.restockIngredient(ingredient, quantity);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        📦 Ingredient Inventory
      </div>
      <div className="panel-content">
        <div className="inventory-grid">
          {Object.entries(shop.ingredients).map(([ingredient, stock]) => {
            const cost = ingredientCosts[ingredient];
            const stockLevel = getStockLevel(stock, ingredient);
            
            return (
              <div key={ingredient} className="inventory-item">
                <div className="inventory-header">
                  <span className="inventory-icon">
                    {ingredientIcons[ingredient]}
                  </span>
                  <span className="inventory-name">{ingredient}</span>
                  <span className={`stock-level stock-${stockLevel}`}>
                    {stock}
                  </span>
                </div>
                
                <div className="inventory-cost">
                  ${cost.toFixed(2)} per unit
                </div>
                
                <div className="inventory-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => restockIngredient(ingredient, 5)}
                    disabled={!canAfford(ingredient, 5)}
                    title={`Buy 5 for $${(cost * 5).toFixed(2)}`}
                  >
                    +5 (${(cost * 5).toFixed(2)})
                  </button>
                  <button
                    className="btn btn-info btn-small"
                    onClick={() => restockIngredient(ingredient, 10)}
                    disabled={!canAfford(ingredient, 10)}
                    title={`Buy 10 for $${(cost * 10).toFixed(2)}`}
                  >
                    +10 (${(cost * 10).toFixed(2)})
                  </button>
                </div>
                
                {stockLevel === 'out' && (
                  <div className="stock-warning">
                    ⚠️ Out of stock!
                  </div>
                )}
                {stockLevel === 'low' && (
                  <div className="stock-warning low">
                    📉 Running low
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="inventory-summary">
          <div className="summary-row">
            <strong>Total Inventory Value:</strong>
            <span>
              ${Object.entries(shop.ingredients).reduce((total, [ingredient, stock]) => {
                return total + (stock * ingredientCosts[ingredient]);
              }, 0).toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <strong>Total Ingredients:</strong>
            <span>
              {Object.values(shop.ingredients).reduce((a, b) => a + b, 0)} units
            </span>
          </div>
        </div>
        
        <div className="quick-restock">
          <h4>🚚 Quick Restock</h4>
          <button
            className="btn btn-warning"
            onClick={() => {
              Object.keys(shop.ingredients).forEach(ingredient => {
                if (shop.ingredients[ingredient] < 10) {
                  restockIngredient(ingredient, 10);
                }
              });
            }}
            disabled={Object.keys(shop.ingredients).every(ingredient => 
              shop.ingredients[ingredient] >= 10 || !canAfford(ingredient, 10)
            )}
          >
            🔄 Restock All Low Items
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryPanel;