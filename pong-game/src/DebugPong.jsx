import React, { useRef, useEffect, useState } from 'react';

function DebugPong() {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Loading...');
  const [canvasReady, setCanvasReady] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) {
      setStatus('Canvas ref not available');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setStatus('Could not get 2D context');
        return;
      }

      setCanvasReady(true);
      setStatus('Canvas ready!');

      // Simple draw test
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(50, 50, 100, 100);
      
      setStatus('Canvas drawing test successful');

      // Try to create PongEngine
      try {
        const PongEngine = require('./PongEngine').default;
        engineRef.current = new PongEngine(canvas);
        setStatus('PongEngine created successfully');
      } catch (engineError) {
        setStatus(`PongEngine error: ${engineError.message}`);
        console.error('PongEngine error:', engineError);
      }

    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Canvas error:', error);
    }
  }, []);

  const handleStart = () => {
    if (engineRef.current) {
      try {
        engineRef.current.start();
        setStatus('Game started!');
      } catch (error) {
        setStatus(`Start error: ${error.message}`);
        console.error('Start error:', error);
      }
    } else {
      setStatus('No engine available');
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Debug Pong</h1>
      <p>Status: {status}</p>
      <p>Canvas Ready: {canvasReady ? '✅' : '❌'}</p>
      
      <div style={{ margin: '20px 0' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{ border: '2px solid #333', background: '#000' }}
        />
      </div>
      
      <button onClick={handleStart} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Start Game
      </button>
    </div>
  );
}

export default DebugPong;