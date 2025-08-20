import React from 'react';

function DailySummary({ summary }) {
  if (!summary) return null;

  const dailyPnL = summary.endingCash - summary.startingCash + summary.rent;
  
  return (
    <div className="daily-summary">
      <h3>Day {summary.day} Summary</h3>
      <div className="summary-stats">
        <div className="summary-row">
          <label>Starting Cash:</label>
          <span>${summary.startingCash.toFixed(2)}</span>
        </div>
        
        <div className="summary-row">
          <label>Ending Cash:</label>
          <span>${summary.endingCash.toFixed(2)}</span>
        </div>
        
        <div className="summary-row">
          <label>Rent Paid:</label>
          <span className="negative">-${summary.rent.toFixed(2)}</span>
        </div>
        
        <div className="summary-row highlight">
          <label>Daily P&L:</label>
          <span className={dailyPnL >= 0 ? 'positive' : 'negative'}>
            {dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)}
          </span>
        </div>
        
        <div className="summary-row">
          <label>Net Worth:</label>
          <span className={summary.netWorth >= 0 ? 'positive' : 'negative'}>
            ${summary.netWorth.toFixed(2)}
          </span>
        </div>
        
        <div className="summary-row">
          <label>Realized P&L:</label>
          <span className={summary.realizedPnL >= 0 ? 'positive' : 'negative'}>
            {summary.realizedPnL >= 0 ? '+' : ''}${summary.realizedPnL.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DailySummary;