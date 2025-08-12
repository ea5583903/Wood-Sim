import React, { useEffect, useRef } from 'react';
import Game from './Game';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    
    gameRef.current = new Game(canvas);
    gameRef.current.start();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="App">
      <div className="game-container">
        <h1>Space Shooter</h1>
        <div className="controls">
          <p>Controls: WASD/Arrow Keys to move, Space to shoot, P to pause</p>
          <p>Survive the waves! Collect power-ups for rapid fire (R) and shields (S)</p>
          <p>Build combos by destroying enemies without taking damage</p>
          <p>Game Over: L for leaderboard, Enter name for high scores</p>
        </div>
        <canvas 
          ref={canvasRef}
          style={{
            border: '2px solid #333',
            backgroundColor: '#000',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>
    </div>
  );
}

export default App;
