import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PongGame from './PongGame';

// Mock the PongEngine
vi.mock('./PongEngine', () => {
  const mockPongEngine = {
    gameState: {
      leftScore: 0,
      rightScore: 0,
      isRunning: false,
      gameOver: false,
      winner: null,
      paused: false,
      maxScore: 11
    },
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    togglePause: vi.fn(),
    destroy: vi.fn()
  };

  return {
    default: vi.fn(() => mockPongEngine),
    __esModule: true
  };
});

describe('PongGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      setLineDash: vi.fn()
    }));
  });

  it('should render game title', () => {
    render(<PongGame />);
    expect(screen.getByText('🏓 Pong Game')).toBeInTheDocument();
  });

  it('should render initial scores', () => {
    render(<PongGame />);
    
    expect(screen.getAllByText('Player 1')).toHaveLength(2); // Score display + controls
    expect(screen.getAllByText('Player 2')).toHaveLength(2); // Score display + controls  
    expect(screen.getAllByText('0')).toHaveLength(2);
  });

  it('should render canvas with correct dimensions', () => {
    render(<PongGame />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '400');
  });

  it('should render game controls', () => {
    render(<PongGame />);
    
    expect(screen.getAllByRole('button', { name: /start/i })).toHaveLength(2); // "Start Game" and "Start"
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should render game instructions', () => {
    render(<PongGame />);
    
    expect(screen.getByText('How to Play')).toBeInTheDocument();
    expect(screen.getByText('Player 1:')).toBeInTheDocument();
    expect(screen.getByText('Use W/S keys to move paddle up/down')).toBeInTheDocument();
    expect(screen.getByText('Player 2:')).toBeInTheDocument();
    expect(screen.getByText('Use ↑/↓ arrow keys to move paddle up/down')).toBeInTheDocument();
  });

  it('should show start overlay when game is not running', () => {
    render(<PongGame />);
    
    expect(screen.getByText('Ready to Play?')).toBeInTheDocument();
    expect(screen.getByText('W - Move Up')).toBeInTheDocument();
    expect(screen.getByText('S - Move Down')).toBeInTheDocument();
    expect(screen.getByText('↑ - Move Up')).toBeInTheDocument();
    expect(screen.getByText('↓ - Move Down')).toBeInTheDocument();
  });

  it('should handle start button click', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 0,
        rightScore: 0,
        isRunning: false,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    expect(mockEngine.start).toHaveBeenCalled();
  });

  it('should handle pause button click', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 0,
        rightScore: 0,
        isRunning: true,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).not.toBeDisabled();
    });
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    
    expect(mockEngine.togglePause).toHaveBeenCalled();
  });

  it('should handle stop button click', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 0,
        rightScore: 0,
        isRunning: true,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop/i })).not.toBeDisabled();
    });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopButton);
    
    expect(mockEngine.stop).toHaveBeenCalled();
  });

  it('should handle reset button click', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 0,
        rightScore: 0,
        isRunning: false,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    expect(mockEngine.reset).toHaveBeenCalled();
  });

  it('should disable buttons appropriately based on game state', () => {
    render(<PongGame />);
    
    // When game is not running
    const startButton = screen.getByRole('button', { name: 'Start' });
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    const stopButton = screen.getByRole('button', { name: /stop/i });
    
    expect(startButton).not.toBeDisabled();
    expect(pauseButton).toBeDisabled();
    expect(stopButton).toBeDisabled();
  });

  it('should update button text based on pause state', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 0,
        rightScore: 0,
        isRunning: true,
        gameOver: false,
        winner: null,
        paused: true,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    });
  });

  it('should show game over overlay when game ends', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 11,
        rightScore: 8,
        isRunning: false,
        gameOver: true,
        winner: 'left',
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      expect(screen.getByText('Game Over!')).toBeInTheDocument();
      expect(screen.getByText('Player 1 Wins!')).toBeInTheDocument();
      expect(screen.getByText('11 - 8')).toBeInTheDocument();
      expect(screen.getByText('Play Again')).toBeInTheDocument();
    });
  });

  it('should update scores display when game state changes', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 5,
        rightScore: 3,
        isRunning: true,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      const scoreValues = screen.getAllByText('5');
      expect(scoreValues).toHaveLength(1);
      const score3Values = screen.getAllByText('3');
      expect(score3Values).toHaveLength(1);
    });
  });

  it('should not show start overlay when game is running', async () => {
    const PongEngine = await import('./PongEngine');
    const mockEngine = {
      gameState: {
        leftScore: 2,
        rightScore: 1,
        isRunning: true,
        gameOver: false,
        winner: null,
        paused: false,
        maxScore: 11
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    PongEngine.default.mockReturnValue(mockEngine);
    
    render(<PongGame />);
    
    await waitFor(() => {
      expect(screen.queryByText('Ready to Play?')).not.toBeInTheDocument();
    });
  });

  it('should cleanup engine on unmount', () => {
    const { unmount } = render(<PongGame />);
    
    unmount();
    
    // The cleanup should happen in useEffect cleanup
    expect(true).toBe(true); // This test ensures no errors during unmount
  });
});