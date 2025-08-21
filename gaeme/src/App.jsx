import React, { useState, useEffect } from 'react';
import GameEngine from './GameEngine';
import GameBoard from './GameBoard';
import InstructionManual from './components/InstructionManual';
import './App.css';

function App() {
  const [gameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState(gameEngine.gameState);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    // Show welcome dialog for first-time players
    return !localStorage.getItem('miniTycoonPlayed');
  });

  useEffect(() => {
    // Update component state when game state changes
    const updateInterval = setInterval(() => {
      setGameState({ ...gameEngine.gameState });
    }, 100); // Update UI 10 times per second

    return () => clearInterval(updateInterval);
  }, [gameEngine]);

  const startGame = () => {
    localStorage.setItem('miniTycoonPlayed', 'true');
    setShowWelcome(false);
    gameEngine.start();
    setIsGameRunning(true);
  };

  const handleWelcomeClose = () => {
    localStorage.setItem('miniTycoonPlayed', 'true');
    setShowWelcome(false);
  };

  const stopGame = () => {
    gameEngine.stop();
    setIsGameRunning(false);
  };

  const resetGame = () => {
    gameEngine.resetGame();
    setGameState({ ...gameEngine.gameState });
    setIsGameRunning(false);
  };

  const saveGame = () => {
    if (gameEngine.saveGame()) {
      gameEngine.addAlert('Game saved successfully!', 'success');
    } else {
      gameEngine.addAlert('Failed to save game!', 'error');
    }
  };

  const loadGame = () => {
    if (gameEngine.loadGame()) {
      setGameState({ ...gameEngine.gameState });
      gameEngine.addAlert('Game loaded successfully!', 'success');
    } else {
      gameEngine.addAlert('No saved game found!', 'error');
    }
  };

  return (
    <div className="App">
      <div className="game-container">
        <h1>Mini Tycoon</h1>
        <div className="game-controls">
          <button 
            onClick={() => setShowInstructions(true)} 
            className="btn btn-info"
          >
            📖 Instructions
          </button>
          {!isGameRunning ? (
            <button onClick={startGame} className="btn btn-primary">
              ▶️ Start Game
            </button>
          ) : (
            <button onClick={stopGame} className="btn btn-secondary">
              ⏸️ Pause Game
            </button>
          )}
          <button onClick={resetGame} className="btn btn-warning">
            🔄 Reset Game
          </button>
          <button onClick={saveGame} className="btn btn-success">
            💾 Save Game
          </button>
          <button onClick={loadGame} className="btn btn-info">
            📁 Load Game
          </button>
        </div>
        
        <GameBoard 
          gameState={gameState} 
          gameEngine={gameEngine}
        />
        
        <InstructionManual 
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
        />
        
        {showWelcome && (
          <div className="welcome-overlay">
            <div className="welcome-modal">
              <h2>🎉 Welcome to Mini Tycoon!</h2>
              <p>
                You're about to enter the fast-paced world of commodity trading! 
                Start with $1,000 and grow your wealth by buying low and selling high.
              </p>
              <div className="welcome-stats">
                <div className="stat">🎯 <strong>Goal:</strong> Reach $5,000 net worth</div>
                <div className="stat">⏰ <strong>Time:</strong> Survive 10 days</div>
                <div className="stat">💰 <strong>Start:</strong> $1,000 cash</div>
                <div className="stat">📦 <strong>Storage:</strong> 100 units max</div>
              </div>
              <div className="welcome-actions">
                <button 
                  onClick={() => setShowInstructions(true)}
                  className="btn btn-info"
                >
                  📖 Read Instructions First
                </button>
                <button 
                  onClick={startGame}
                  className="btn btn-primary"
                >
                  🚀 Start Trading!
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
