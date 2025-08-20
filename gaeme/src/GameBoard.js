import React from 'react';
import TopBar from './components/TopBar';
import GoodsTable from './components/GoodsTable';
import OrderHistory from './components/OrderHistory';
import AlertsPanel from './components/AlertsPanel';
import DailySummary from './components/DailySummary';
import './GameBoard.css';

function GameBoard({ gameState, gameEngine }) {
  return (
    <div className="game-board">
      <TopBar gameState={gameState} />
      
      <div className="main-content">
        <div className="left-panel">
          <GoodsTable 
            gameState={gameState} 
            gameEngine={gameEngine}
          />
          <AlertsPanel alerts={gameState.alerts} />
        </div>
        
        <div className="right-panel">
          <OrderHistory orders={gameState.orderHistory} />
          {gameState.dailySummary && (
            <DailySummary summary={gameState.dailySummary} />
          )}
        </div>
      </div>
      
      {gameState.gameStatus !== 'playing' && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>
              {gameState.gameStatus === 'won' ? '🎉 Victory!' : '💀 Game Over'}
            </h2>
            <p>
              {gameState.gameStatus === 'won' 
                ? `Congratulations! You reached $5,000 net worth!`
                : `You went bankrupt. Better luck next time!`
              }
            </p>
            <div className="final-stats">
              <p>Final Net Worth: ${gameState.player.netWorth.toFixed(2)}</p>
              <p>Days Survived: {gameState.currentDay - 1}</p>
              <p>Total Rent Paid: ${gameState.player.totalRent.toFixed(2)}</p>
              <p>Realized P&L: ${gameState.player.realizedPnL.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;