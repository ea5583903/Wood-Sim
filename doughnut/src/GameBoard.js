import React from 'react';
import StatusBar from './components/StatusBar';
import CustomerQueue from './components/CustomerQueue';
import ShopMenu from './components/ShopMenu';
import InventoryPanel from './components/InventoryPanel';
import ProductionPanel from './components/ProductionPanel';
import AlertsPanel from './components/AlertsPanel';
import './GameBoard.css';

function GameBoard({ gameState, gameEngine }) {
  const { shop, customerQueue, currentDay, currentTick, alerts, stats } = gameState;

  return (
    <div className="game-board">
      <StatusBar 
        shop={shop}
        currentDay={currentDay}
        currentTick={currentTick}
        stats={stats}
      />
      
      <div className="game-content">
        <div className="left-panel">
          <CustomerQueue 
            customers={customerQueue}
            gameEngine={gameEngine}
          />
        </div>
        
        <div className="center-panel">
          <ShopMenu 
            shop={shop}
            gameEngine={gameEngine}
          />
          <ProductionPanel 
            shop={shop}
            gameEngine={gameEngine}
          />
        </div>
        
        <div className="right-panel">
          <InventoryPanel 
            shop={shop}
            gameEngine={gameEngine}
          />
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

export default GameBoard;