import React from 'react';

function TopBar({ gameState }) {
  const currentDayTick = gameState.currentTick % gameState.ticksPerDay;
  const progress = (currentDayTick / gameState.ticksPerDay) * 100;
  
  return (
    <div className="top-bar">
      <div className="time-info">
        <div className="day-info">
          <strong>Day {gameState.currentDay}</strong>
          <div className="day-progress">
            <div 
              className="day-progress-bar" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="tick-info">
            Tick {currentDayTick}/{gameState.ticksPerDay}
          </span>
        </div>
      </div>
      
      <div className="player-stats">
        <div className="stat-item">
          <label>Cash:</label>
          <span className={`value ${gameState.player.cash < 0 ? 'negative' : ''}`}>
            ${gameState.player.cash.toFixed(2)}
          </span>
        </div>
        
        <div className="stat-item">
          <label>Storage:</label>
          <span className="value">
            {gameState.player.storageUsed}/{gameState.player.storageCap}
          </span>
          <div className="storage-bar">
            <div 
              className="storage-fill" 
              style={{ 
                width: `${(gameState.player.storageUsed / gameState.player.storageCap) * 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        <div className="stat-item">
          <label>Net Worth:</label>
          <span className={`value ${gameState.player.netWorth < 0 ? 'negative' : 'positive'}`}>
            ${gameState.player.netWorth.toFixed(2)}
          </span>
        </div>
        
        <div className="stat-item">
          <label>Daily Rent:</label>
          <span className="value negative">
            ${gameState.player.rentPerDay}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopBar;