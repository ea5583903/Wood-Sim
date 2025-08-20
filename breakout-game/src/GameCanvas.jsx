import React, { useRef, useEffect, useState } from 'react';
import GameEngine from './GameEngine';
import './GameCanvas.css';

function GameCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    level: 1,
    isRunning: false,
    gameOver: false,
    victory: false,
    paused: false
  });

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current);
      
      // Update component state with game state
      const updateInterval = setInterval(() => {
        if (engineRef.current) {
          setGameState({...engineRef.current.gameState});
        }
      }, 100);

      return () => {
        clearInterval(updateInterval);
        if (engineRef.current) {
          engineRef.current.destroy();
        }
      };
    }
  }, []);

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  const handleStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  };

  const handleReset = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setGameState({...engineRef.current.gameState});
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🧱 Breakout Game</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives:</span>
            <span className="stat-value">{gameState.lives}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level:</span>
            <span className="stat-value">{gameState.level}</span>
          </div>
        </div>
      </div>

      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas"
          tabIndex={0}
        />
        
        {!gameState.isRunning && !gameState.gameOver && !gameState.victory && (
          <div className="game-overlay start-overlay">
            <div className="overlay-content">
              <h2>Ready to Play?</h2>
              <p>Use arrow keys or mouse to move the paddle</p>
              <p>Press SPACE to pause during the game</p>
              <button onClick={handleStart} className="btn btn-primary">
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="game-controls">
        <button 
          onClick={handleStart} 
          disabled={gameState.isRunning && !gameState.paused}
          className="btn btn-success"
        >
          Start
        </button>
        
        <button 
          onClick={handlePause} 
          disabled={!gameState.isRunning}
          className="btn btn-warning"
        >
          {gameState.paused ? 'Resume' : 'Pause'}
        </button>
        
        <button 
          onClick={handleStop} 
          disabled={!gameState.isRunning}
          className="btn btn-danger"
        >
          Stop
        </button>
        
        <button 
          onClick={handleReset}
          className="btn btn-secondary"
        >
          Reset
        </button>
      </div>

      <div className="game-instructions">
        <h3>How to Play</h3>
        <ul>
          <li><strong>Move Paddle:</strong> Use arrow keys (← →) or move your mouse</li>
          <li><strong>Pause Game:</strong> Press SPACE key</li>
          <li><strong>Goal:</strong> Break all the bricks with the ball</li>
          <li><strong>Scoring:</strong> Different colored bricks give different points</li>
          <li><strong>Lives:</strong> Don't let the ball fall below the paddle!</li>
        </ul>
      </div>
    </div>
  );
}

export default GameCanvas;