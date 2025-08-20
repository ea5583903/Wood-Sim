import React, { useState } from 'react';
import GameCanvas from './GameCanvas.jsx';
import './App.css';

function App() {
  const [gameState, setGameState] = useState({
    currentLevel: 0,
    score: 0,
    lives: 3,
    isRunning: false,
    gameOver: false,
    victory: false,
    alerts: []
  });
  
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('doughnutPlatformerPlayed');
  });

  const handleGameStateChange = (newGameState) => {
    setGameState(newGameState);
  };

  const startGame = () => {
    localStorage.setItem('doughnutPlatformerPlayed', 'true');
    setShowWelcome(false);
    setGameState(prev => ({ ...prev, isRunning: true }));
  };

  const handleWelcomeClose = () => {
    localStorage.setItem('doughnutPlatformerPlayed', 'true');
    setShowWelcome(false);
  };

  return (
    <div className="App">
      <div className="game-container">
        <h1>🍩 Doughnut Dash Platformer</h1>
        
        <GameCanvas 
          gameState={gameState}
          onGameStateChange={handleGameStateChange}
        />
        
        {showWelcome && (
          <div className="welcome-overlay">
            <div className="welcome-modal">
              <h2>🍩 Welcome to Doughnut Dash Platformer!</h2>
              <p>
                Jump, run, and collect doughnuts in this exciting platformer adventure! 
                Navigate through challenging levels while avoiding enemies and gathering tasty treats.
              </p>
              <div className="welcome-stats">
                <div className="stat">🎯 <strong>Goal:</strong> Complete all 3 levels</div>
                <div className="stat">🍩 <strong>Collect:</strong> Doughnuts, cherries, and golden treats</div>
                <div className="stat">💀 <strong>Enemies:</strong> Jump on them or avoid them</div>
                <div className="stat">❤️ <strong>Lives:</strong> Don't lose all 3 lives!</div>
                <div className="stat">🚪 <strong>Exit:</strong> Reach the green exit to complete each level</div>
              </div>
              <div className="welcome-actions">
                <button 
                  onClick={startGame}
                  className="btn btn-primary"
                >
                  🚀 Start Adventure!
                </button>
                <button 
                  onClick={handleWelcomeClose}
                  className="btn btn-secondary"
                >
                  Skip Welcome
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
