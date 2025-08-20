import React, { useRef, useEffect } from 'react';
import PlatformerEngine from './PlatformerEngine';
import './GameCanvas.css';

function GameCanvas({ gameState, onGameStateChange }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new PlatformerEngine(canvasRef.current);
      
      // Update parent component with game state changes
      const updateInterval = setInterval(() => {
        if (engineRef.current && onGameStateChange) {
          onGameStateChange(engineRef.current.gameState);
        }
      }, 100);

      return () => {
        clearInterval(updateInterval);
        if (engineRef.current) {
          engineRef.current.stop();
        }
      };
    }
  }, [onGameStateChange]);

  useEffect(() => {
    if (engineRef.current) {
      if (gameState.isRunning && !engineRef.current.gameState.isRunning) {
        engineRef.current.start();
      } else if (!gameState.isRunning && engineRef.current.gameState.isRunning) {
        engineRef.current.stop();
      }
    }
  }, [gameState.isRunning]);

  const startGame = () => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const stopGame = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  const resetGame = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
  };

  return (
    <div className="game-canvas-container">
      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef}
          className="game-canvas"
          tabIndex={0}
        />
      </div>
      
      <div className="game-info">
        <div className="game-controls">
          {!gameState.isRunning ? (
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
        </div>
        
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{gameState.score || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lives:</span>
            <span className="stat-value">{gameState.lives || 3}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{(gameState.currentLevel || 0) + 1}</span>
          </div>
        </div>
        
        <div className="instructions">
          <h4>🎮 Controls</h4>
          <div className="control-list">
            <div className="control-item">
              <span className="control-key">←→ / A D</span>
              <span className="control-desc">Move left/right</span>
            </div>
            <div className="control-item">
              <span className="control-key">↑ / W / Space</span>
              <span className="control-desc">Jump</span>
            </div>
          </div>
        </div>
        
        <div className="game-objectives">
          <h4>🎯 Objectives</h4>
          <ul>
            <li>🍩 Collect doughnuts for points</li>
            <li>🍒 Cherries are worth more points</li>
            <li>🥇 Golden doughnuts are the most valuable</li>
            <li>💀 Avoid or jump on enemies</li>
            <li>🚪 Reach the green exit to complete the level</li>
            <li>❤️ Don't lose all your lives!</li>
          </ul>
        </div>
        
        {gameState.alerts && gameState.alerts.length > 0 && (
          <div className="alerts-panel">
            <h4>📢 Recent Events</h4>
            <div className="alerts-list">
              {gameState.alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`alert alert-${alert.type}`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameCanvas;