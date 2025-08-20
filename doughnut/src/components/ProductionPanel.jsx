import React from 'react';

function ProductionPanel({ shop, gameEngine }) {
  const recipes = {
    'Plain': { 'Dough': 1, 'Sugar': 1 },
    'Chocolate': { 'Dough': 1, 'Sugar': 1, 'Chocolate': 1 },
    'Strawberry': { 'Dough': 1, 'Sugar': 1, 'Strawberry': 1 },
    'Boston Cream': { 'Dough': 1, 'Sugar': 1, 'Cream': 1 },
    'Jelly-Filled': { 'Dough': 1, 'Sugar': 1, 'Jelly': 1 }
  };

  const doughnutIcons = {
    'Plain': '🍩',
    'Chocolate': '🍫',
    'Strawberry': '🍓',
    'Boston Cream': '🍰',
    'Jelly-Filled': '🍯'
  };

  const getMaxCanMake = (recipe) => {
    const required = recipes[recipe];
    let max = Infinity;
    
    for (const [ingredient, needed] of Object.entries(required)) {
      const available = shop.ingredients[ingredient];
      max = Math.min(max, Math.floor(available / needed));
    }
    
    return max === Infinity ? 0 : max;
  };

  const makeMax = (recipe) => {
    const maxCanMake = getMaxCanMake(recipe);
    if (maxCanMake > 0) {
      gameEngine.makeDoughnut(recipe, maxCanMake);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        🔧 Production Center
      </div>
      <div className="panel-content">
        <div className="production-grid">
          {Object.entries(recipes).map(([recipe, ingredients]) => {
            const maxCanMake = getMaxCanMake(recipe);
            const canMakeAny = maxCanMake > 0;
            
            return (
              <div key={recipe} className="production-item">
                <div className="production-header">
                  <span className="production-icon">
                    {doughnutIcons[recipe]}
                  </span>
                  <span className="production-name">{recipe}</span>
                  <span className="max-make">Max: {maxCanMake}</span>
                </div>
                
                <div className="recipe-ingredients">
                  {Object.entries(ingredients).map(([ingredient, needed]) => {
                    const available = shop.ingredients[ingredient];
                    const hasEnough = available >= needed;
                    
                    return (
                      <div 
                        key={ingredient} 
                        className={`ingredient-requirement ${hasEnough ? 'available' : 'missing'}`}
                      >
                        {needed} {ingredient} ({available})
                      </div>
                    );
                  })}
                </div>
                
                <div className="production-actions">
                  <button
                    className="btn btn-success btn-small"
                    onClick={() => gameEngine.makeDoughnut(recipe, 1)}
                    disabled={!canMakeAny}
                  >
                    Make 1
                  </button>
                  <button
                    className="btn btn-info btn-small"
                    onClick={() => gameEngine.makeDoughnut(recipe, Math.min(5, maxCanMake))}
                    disabled={!canMakeAny}
                  >
                    Make 5
                  </button>
                  <button
                    className="btn btn-warning btn-small"
                    onClick={() => makeMax(recipe)}
                    disabled={!canMakeAny}
                  >
                    Make Max
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="production-summary">
          <h4>🎯 Production Tips</h4>
          <ul className="tips-list">
            <li><strong>Plain doughnuts</strong> are cheapest to make</li>
            <li><strong>Specialty doughnuts</strong> sell for higher prices</li>
            <li><strong>Pre-make popular items</strong> to serve customers faster</li>
            <li><strong>Watch ingredient levels</strong> to avoid running out</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProductionPanel;