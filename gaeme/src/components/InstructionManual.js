import React, { useState } from 'react';
import './InstructionManual.css';

function InstructionManual({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('basics');

  if (!isOpen) return null;

  const tabs = [
    { id: 'basics', label: 'Basics', icon: '📚' },
    { id: 'trading', label: 'Trading', icon: '💰' },
    { id: 'strategy', label: 'Strategy', icon: '🎯' },
    { id: 'economics', label: 'Economics', icon: '📊' },
    { id: 'tips', label: 'Tips', icon: '💡' }
  ];

  return (
    <div className="instruction-overlay">
      <div className="instruction-modal">
        <div className="instruction-header">
          <h2>📖 Mini Tycoon - Instruction Manual</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        
        <div className="instruction-content">
          <div className="instruction-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="instruction-body">
            {activeTab === 'basics' && <BasicsTab />}
            {activeTab === 'trading' && <TradingTab />}
            {activeTab === 'strategy' && <StrategyTab />}
            {activeTab === 'economics' && <EconomicsTab />}
            {activeTab === 'tips' && <TipsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicsTab() {
  return (
    <div className="tab-content">
      <h3>🎮 Game Overview</h3>
      <p>
        Welcome to Mini Tycoon! You're a commodity trader with $1,000 starting capital. 
        Your goal is to buy low, sell high, and grow your net worth through smart trading.
      </p>

      <div className="info-section">
        <h4>🎯 Win Conditions</h4>
        <ul>
          <li><strong>Victory:</strong> Reach $5,000 net worth</li>
          <li><strong>Alternative:</strong> Survive 10 days without going bankrupt</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>💀 Lose Condition</h4>
        <ul>
          <li><strong>Bankruptcy:</strong> Your cash goes negative</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>⏰ Time System</h4>
        <ul>
          <li><strong>1 Tick = 1 Second</strong> in real time</li>
          <li><strong>1 Day = 60 Ticks</strong> (1 minute)</li>
          <li>Prices update every tick</li>
          <li>Rent is paid at the end of each day</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>📊 The Interface</h4>
        <ul>
          <li><strong>Top Bar:</strong> Cash, storage, net worth, day progress</li>
          <li><strong>Market Table:</strong> Live prices, charts, your inventory</li>
          <li><strong>Right Panel:</strong> Trade history and daily summaries</li>
          <li><strong>Alerts:</strong> Important messages and trade confirmations</li>
        </ul>
      </div>
    </div>
  );
}

function TradingTab() {
  return (
    <div className="tab-content">
      <h3>💰 How Trading Works</h3>

      <div className="info-section">
        <h4>📈 Market Prices</h4>
        <ul>
          <li><strong>Current Price:</strong> The mid-market price shown</li>
          <li><strong>Bid Price:</strong> What you receive when selling</li>
          <li><strong>Ask Price:</strong> What you pay when buying</li>
          <li><strong>Spread:</strong> 0.25% difference between bid and ask</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>🛒 Buying Goods</h4>
        <ul>
          <li>Click <strong>"Buy 1"</strong>, <strong>"Buy 5"</strong>, or <strong>"Buy Max"</strong></li>
          <li>You pay the <strong>Ask Price</strong> (slightly above market)</li>
          <li>Trading fee: <strong>0.5%</strong> of total transaction</li>
          <li>Goods consume storage space (100 unit limit)</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>💸 Selling Goods</h4>
        <ul>
          <li>Click <strong>"Sell 1"</strong>, <strong>"Sell 5"</strong>, or <strong>"Sell All"</strong></li>
          <li>You receive the <strong>Bid Price</strong> (slightly below market)</li>
          <li>Trading fee: <strong>0.5%</strong> of total transaction</li>
          <li>Frees up storage space for new purchases</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>📊 Inventory Tracking</h4>
        <ul>
          <li><strong>Quantity:</strong> How many units you own</li>
          <li><strong>Average Cost:</strong> Your cost basis per unit</li>
          <li><strong>Unrealized P&L:</strong> Profit/loss if you sold now</li>
          <li><strong>Realized P&L:</strong> Actual profit/loss from completed trades</li>
        </ul>
      </div>

      <div className="trade-example">
        <h4>📝 Trading Example</h4>
        <div className="example-box">
          <p><strong>Scenario:</strong> Wheat is at $10.00</p>
          <ul>
            <li>Ask Price: $10.03 (you pay this to buy)</li>
            <li>Bid Price: $9.97 (you receive this when selling)</li>
            <li>Buy 10 units: Cost = $100.30 + $0.50 fee = $100.80</li>
            <li>Sell 10 units: Revenue = $99.70 - $0.50 fee = $99.20</li>
            <li>Net loss from immediate buy/sell: $1.60</li>
          </ul>
          <p><em>This spread prevents instant profit - you need price movement!</em></p>
        </div>
      </div>
    </div>
  );
}

function StrategyTab() {
  return (
    <div className="tab-content">
      <h3>🎯 Trading Strategies</h3>

      <div className="info-section">
        <h4>📊 Understanding Market Behavior</h4>
        <ul>
          <li><strong>Mean Reversion:</strong> Prices tend to return to their base values</li>
          <li><strong>Volatility:</strong> Higher volatility = bigger price swings</li>
          <li><strong>Trends:</strong> Watch the sparkline charts for patterns</li>
        </ul>
      </div>

      <div className="strategy-section">
        <h4>🟢 Buy Low Strategy</h4>
        <div className="strategy-box buy-strategy">
          <p><strong>When to Buy:</strong></p>
          <ul>
            <li>Price is below the base price</li>
            <li>Sparkline shows recent downward trend</li>
            <li>1-minute change is negative</li>
            <li>You have sufficient cash and storage</li>
          </ul>
        </div>
      </div>

      <div className="strategy-section">
        <h4>🔴 Sell High Strategy</h4>
        <div className="strategy-box sell-strategy">
          <p><strong>When to Sell:</strong></p>
          <ul>
            <li>Price is above your average cost</li>
            <li>Price is above the base price</li>
            <li>Sparkline shows upward momentum</li>
            <li>You need cash for other opportunities</li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h4>⚖️ Risk Management</h4>
        <ul>
          <li><strong>Diversify:</strong> Don't put all money in one good</li>
          <li><strong>Cut Losses:</strong> Sell losing positions before they get worse</li>
          <li><strong>Take Profits:</strong> Don't be too greedy - secure gains</li>
          <li><strong>Cash Buffer:</strong> Keep some cash for opportunities</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>⏰ Timing Considerations</h4>
        <ul>
          <li><strong>Daily Rent:</strong> $20 pressure every 60 ticks</li>
          <li><strong>End of Day:</strong> Consider holding vs. selling before rent</li>
          <li><strong>Storage Full:</strong> Must sell before buying more</li>
          <li><strong>Cash Low:</strong> Focus on profitable exits</li>
        </ul>
      </div>
    </div>
  );
}

function EconomicsTab() {
  return (
    <div className="tab-content">
      <h3>📊 Market Economics</h3>

      <div className="goods-overview">
        <h4>🌾 The Three Markets</h4>
        
        <div className="good-card wheat">
          <h5>🌾 Wheat - "The Stable"</h5>
          <ul>
            <li><strong>Base Price:</strong> $10.00</li>
            <li><strong>Range:</strong> $5.00 - $20.00</li>
            <li><strong>Volatility:</strong> Low (2%)</li>
            <li><strong>Character:</strong> Steady, predictable</li>
            <li><strong>Strategy:</strong> Safe investment, small but consistent profits</li>
          </ul>
        </div>

        <div className="good-card copper">
          <h5>🔶 Copper - "The Balanced"</h5>
          <ul>
            <li><strong>Base Price:</strong> $40.00</li>
            <li><strong>Range:</strong> $20.00 - $80.00</li>
            <li><strong>Volatility:</strong> Medium (4%)</li>
            <li><strong>Character:</strong> Moderate swings</li>
            <li><strong>Strategy:</strong> Good risk/reward balance</li>
          </ul>
        </div>

        <div className="good-card chips">
          <h5>💻 Tech Chips - "The Volatile"</h5>
          <ul>
            <li><strong>Base Price:</strong> $120.00</li>
            <li><strong>Range:</strong> $60.00 - $240.00</li>
            <li><strong>Volatility:</strong> High (6%)</li>
            <li><strong>Character:</strong> Wild price swings</li>
            <li><strong>Strategy:</strong> High risk, high reward</li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h4>💸 Cost Structure</h4>
        <ul>
          <li><strong>Trading Fees:</strong> 0.5% of each transaction</li>
          <li><strong>Bid/Ask Spread:</strong> 0.25% (ask higher, bid lower)</li>
          <li><strong>Daily Rent:</strong> $20 fixed cost</li>
          <li><strong>Break-even:</strong> Need >0.75% price movement to profit</li>
        </ul>
      </div>

      <div className="info-section">
        <h4>🔄 Price Movement</h4>
        <ul>
          <li><strong>Mean Reversion:</strong> Prices pull back toward base price</li>
          <li><strong>Random Shocks:</strong> Volatility creates unpredictable movements</li>
          <li><strong>Boundaries:</strong> Prices can't go below min or above max</li>
          <li><strong>No Trends:</strong> No guaranteed up or down movements</li>
        </ul>
      </div>
    </div>
  );
}

function TipsTab() {
  return (
    <div className="tab-content">
      <h3>💡 Pro Tips & Tricks</h3>

      <div className="tips-section">
        <h4>🚀 Getting Started</h4>
        <ul>
          <li>Start with <strong>wheat</strong> - it's the safest market to learn on</li>
          <li>Buy small quantities (1-5 units) until you understand the patterns</li>
          <li>Watch the sparkline charts - they show recent price history</li>
          <li>Don't panic on your first few trades</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>📈 Reading the Markets</h4>
        <ul>
          <li><strong>Green sparklines:</strong> Recent upward trend</li>
          <li><strong>Red sparklines:</strong> Recent downward trend</li>
          <li><strong>1m Δ column:</strong> Shows if price is rising or falling</li>
          <li><strong>Unrealized P&L:</strong> Green = profit, Red = loss</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>💰 Advanced Strategies</h4>
        <ul>
          <li><strong>Contrarian Trading:</strong> Buy when others would sell (price dropping)</li>
          <li><strong>Momentum Trading:</strong> Ride the trend (buy rising, sell falling)</li>
          <li><strong>Rotation Strategy:</strong> Move money between goods based on relative prices</li>
          <li><strong>Cash Management:</strong> Keep 20-30% in cash for opportunities</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>⚠️ Common Mistakes</h4>
        <ul>
          <li><strong>Overtrading:</strong> Too many trades = too many fees</li>
          <li><strong>FOMO:</strong> Don't chase prices that have already moved</li>
          <li><strong>No Stop Loss:</strong> Cut losing positions before they get worse</li>
          <li><strong>Ignoring Rent:</strong> Always factor in daily $20 cost</li>
          <li><strong>Storage Full:</strong> Sell before you can't buy opportunities</li>
        </ul>
      </div>

      <div className="tips-section">
        <h4>🎯 Winning Mindset</h4>
        <ul>
          <li><strong>Patience:</strong> Good opportunities come to those who wait</li>
          <li><strong>Discipline:</strong> Stick to your strategy</li>
          <li><strong>Adaptability:</strong> Market conditions change</li>
          <li><strong>Risk Management:</strong> Preserve capital to trade another day</li>
        </ul>
      </div>

      <div className="success-metrics">
        <h4>📊 Success Metrics</h4>
        <div className="metrics-box">
          <p><strong>Target Performance:</strong></p>
          <ul>
            <li>Day 1-3: Break even (learn the basics)</li>
            <li>Day 4-6: $1,500+ net worth (building confidence)</li>
            <li>Day 7-10: $3,000+ net worth (consistent profits)</li>
            <li>Victory: $5,000+ net worth (tycoon status!)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InstructionManual;