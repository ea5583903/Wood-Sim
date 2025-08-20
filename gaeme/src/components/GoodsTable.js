import React from 'react';
import Sparkline from './Sparkline';

function GoodsTable({ gameState, gameEngine }) {
  const handleBuy = (goodId, quantity) => {
    const result = gameEngine.buyGood(goodId, quantity);
    if (!result.success) {
      gameEngine.addAlert(result.message, 'error');
    }
  };

  const handleSell = (goodId, quantity) => {
    const result = gameEngine.sellGood(goodId, quantity);
    if (!result.success) {
      gameEngine.addAlert(result.message, 'error');
    }
  };

  const calculatePriceChange = (good) => {
    if (good.priceHistory.length < 2) return 0;
    const current = good.currentPrice;
    const previous = good.priceHistory[good.priceHistory.length - 2];
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="goods-table">
      <h3>Market</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Good</th>
              <th>Price</th>
              <th>1m Δ</th>
              <th>Chart</th>
              <th>Owned</th>
              <th>Avg Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gameState.market.goods.map(good => {
              const prices = gameEngine.getBidAskPrices(good.id);
              const priceChange = calculatePriceChange(good);
              const owned = gameState.player.inventory[good.id] || 0;
              const avgCost = gameState.player.avgCost[good.id] || 0;
              const maxBuy = gameEngine.getMaxBuyQuantity(good.id);
              const maxSell = gameEngine.getMaxSellQuantity(good.id);
              
              return (
                <tr key={good.id}>
                  <td className="good-name">
                    <strong>{good.name}</strong>
                    <small>{good.id}</small>
                  </td>
                  
                  <td className="price-cell">
                    <div className="price-info">
                      <span className="current-price">
                        ${good.currentPrice.toFixed(2)}
                      </span>
                      <div className="bid-ask">
                        <small>
                          Bid: ${prices.bid.toFixed(2)} | 
                          Ask: ${prices.ask.toFixed(2)}
                        </small>
                      </div>
                    </div>
                  </td>
                  
                  <td className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </td>
                  
                  <td className="chart-cell">
                    <Sparkline 
                      data={good.priceHistory} 
                      width={80} 
                      height={30}
                    />
                  </td>
                  
                  <td className="inventory-cell">
                    <div className="inventory-info">
                      <span className="quantity">{owned}</span>
                      {owned > 0 && (
                        <div className="unrealized-pnl">
                          <small 
                            className={good.currentPrice >= avgCost ? 'positive' : 'negative'}
                          >
                            {good.currentPrice >= avgCost ? '+' : ''}
                            ${((good.currentPrice - avgCost) * owned).toFixed(2)}
                          </small>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="avg-cost">
                    {owned > 0 ? `$${avgCost.toFixed(2)}` : '-'}
                  </td>
                  
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <div className="buy-buttons">
                        <button 
                          onClick={() => handleBuy(good.id, 1)}
                          disabled={maxBuy < 1}
                          className="btn btn-buy btn-small"
                        >
                          Buy 1
                        </button>
                        <button 
                          onClick={() => handleBuy(good.id, 5)}
                          disabled={maxBuy < 5}
                          className="btn btn-buy btn-small"
                        >
                          Buy 5
                        </button>
                        <button 
                          onClick={() => handleBuy(good.id, maxBuy)}
                          disabled={maxBuy === 0}
                          className="btn btn-buy btn-small"
                        >
                          Buy Max ({maxBuy})
                        </button>
                      </div>
                      
                      <div className="sell-buttons">
                        <button 
                          onClick={() => handleSell(good.id, 1)}
                          disabled={maxSell < 1}
                          className="btn btn-sell btn-small"
                        >
                          Sell 1
                        </button>
                        <button 
                          onClick={() => handleSell(good.id, 5)}
                          disabled={maxSell < 5}
                          className="btn btn-sell btn-small"
                        >
                          Sell 5
                        </button>
                        <button 
                          onClick={() => handleSell(good.id, maxSell)}
                          disabled={maxSell === 0}
                          className="btn btn-sell btn-small"
                        >
                          Sell All ({maxSell})
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GoodsTable;