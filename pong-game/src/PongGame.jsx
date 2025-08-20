import React, { useRef, useEffect, useState } from 'react';
import PongEngine from './PongEngine';
import './PongGame.css';

function PongGame() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState({
    leftScore: 0,
    rightScore: 0,
    isRunning: false,
    gameOver: false,
    winner: null,
    paused: false,
    maxScore: 11
  });

  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new PongEngine(canvasRef.current);
      
      // Update component state with game state
      const updateInterval = setInterval(() => {
        if (engineRef.current) {
          setGameState({...engineRef.current.gameState});
        }
      }, 50);

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
      setGameState({...engineRef.current.gameState});
    }
  };

  const handleStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      setGameState({...engineRef.current.gameState});
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
      setGameState({...engineRef.current.gameState});
    }
  };

  return (
    <div className="pong-container">
      <div className="pong-header">
        <h1>🏓 Pong Game</h1>
        <div className="score-display">
          <div className="score">
            <span className="score-label">Player 1</span>
            <span className="score-value">{gameState.leftScore}</span>
          </div>
          <div className="score-divider">-</div>
          <div className="score">
            <span className="score-value">{gameState.rightScore}</span>
            <span className="score-label">Player 2</span>
          </div>
        </div>
      </div>

      <div className="pong-canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="pong-canvas"
          tabIndex={0}
        />
        
        {!gameState.isRunning && !gameState.gameOver && (
          <div className="game-overlay start-overlay">
            <div className="overlay-content">
              <h2>Ready to Play?</h2>
              <div className="controls-info">
                <div className="player-controls">
                  <h3>Player 1</h3>
                  <p>W - Move Up</p>
                  <p>S - Move Down</p>
                </div>
                <div className="player-controls">
                  <h3>Player 2</h3>
                  <p>↑ - Move Up</p>
                  <p>↓ - Move Down</p>
                </div>
              </div>
              <p>Press SPACE to pause during the game</p>
              <button onClick={handleStart} className="btn btn-primary">
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState.gameOver && (
          <div className="game-overlay game-over-overlay">
            <div className="overlay-content">
              <h2>Game Over!</h2>
              <h3>{gameState.winner === 'left' ? 'Player 1' : 'Player 2'} Wins!</h3>
              <p className="final-score">{gameState.leftScore} - {gameState.rightScore}</p>
              <button onClick={handleReset} className="btn btn-primary">
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pong-controls">
        <button 
          onClick={handleStart} 
          disabled={gameState.isRunning && !gameState.paused}
          className="btn btn-success"
        >
          Start
        </button>
        
        <button 
          onClick={handlePause} 
          disabled={!gameState.isRunning || gameState.gameOver}
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
          <li><strong>Player 1:</strong> Use W/S keys to move paddle up/down</li>
          <li><strong>Player 2:</strong> Use ↑/↓ arrow keys to move paddle up/down</li>
          <li><strong>Pause:</strong> Press SPACE key during the game</li>
          <li><strong>Goal:</strong> First player to reach {gameState.maxScore} points wins</li>
          <li><strong>Scoring:</strong> Ball must pass your opponent's paddle</li>
        </ul>
      </div>
    </div>
  );
}

export default PongGame;