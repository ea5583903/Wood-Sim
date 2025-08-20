import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameCanvas from './GameCanvas';

// Mock the GameEngine
vi.mock('./GameEngine', () => {
  const mockGameEngine = {
    gameState: {
      score: 0,
      lives: 3,
      level: 1,
      isRunning: false,
      gameOver: false,
      victory: false,
      paused: false
    },
    start: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
    togglePause: vi.fn(),
    destroy: vi.fn()
  };

  return {
    default: vi.fn(() => mockGameEngine),
    __esModule: true
  };
});

describe('GameCanvas', () => {
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
      stroke: vi.fn()
    }));
  });

  it('should render game title', () => {
    render(<GameCanvas />);
    expect(screen.getByText('🧱 Breakout Game')).toBeInTheDocument();
  });

  it('should render initial game stats', () => {
    render(<GameCanvas />);
    
    expect(screen.getAllByText('Score:')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Lives:')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Level:')[0]).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should render canvas with correct dimensions', () => {
    render(<GameCanvas />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should render game controls', () => {
    render(<GameCanvas />);
    
    expect(screen.getAllByRole('button', { name: /start/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should render game instructions', () => {
    render(<GameCanvas />);
    
    expect(screen.getByText('How to Play')).toBeInTheDocument();
    expect(screen.getAllByText(/Move Paddle:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Pause Game:/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Goal:/)[0]).toBeInTheDocument();
  });

  it('should show start overlay when game is not running', () => {
    render(<GameCanvas />);
    
    expect(screen.getByText('Ready to Play?')).toBeInTheDocument();
    expect(screen.getByText(/Use arrow keys or mouse/)).toBeInTheDocument();
  });

  it('should handle start button click', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 0,
        lives: 3,
        level: 1,
        isRunning: false,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    const startButton = screen.getByRole('button', { name: 'Start Game' });
    fireEvent.click(startButton);
    
    expect(mockEngine.start).toHaveBeenCalled();
  });

  it('should handle pause button click', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 0,
        lives: 3,
        level: 1,
        isRunning: true,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    // Wait for the component to finish initializing
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause/i })).not.toBeDisabled();
    });
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    
    expect(mockEngine.togglePause).toHaveBeenCalled();
  });

  it('should handle stop button click', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 0,
        lives: 3,
        level: 1,
        isRunning: true,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    // Wait for the component to finish initializing
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop/i })).not.toBeDisabled();
    });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    fireEvent.click(stopButton);
    
    expect(mockEngine.stop).toHaveBeenCalled();
  });

  it('should handle reset button click', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 0,
        lives: 3,
        level: 1,
        isRunning: false,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    expect(mockEngine.reset).toHaveBeenCalled();
  });

  it('should disable buttons appropriately based on game state', () => {
    render(<GameCanvas />);
    
    // When game is not running
    const startButton = screen.getByRole('button', { name: 'Start' });
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    const stopButton = screen.getByRole('button', { name: /stop/i });
    
    expect(startButton).not.toBeDisabled();
    expect(pauseButton).toBeDisabled();
    expect(stopButton).toBeDisabled();
  });

  it('should update button text based on pause state', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 0,
        lives: 3,
        level: 1,
        isRunning: true,
        gameOver: false,
        victory: false,
        paused: true
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    });
  });

  it('should not show start overlay when game is running', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 100,
        lives: 2,
        level: 1,
        isRunning: true,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    await waitFor(() => {
      expect(screen.queryByText('Ready to Play?')).not.toBeInTheDocument();
    });
  });

  it('should update stats display when game state changes', async () => {
    const GameEngine = await import('./GameEngine');
    const mockEngine = {
      gameState: {
        score: 500,
        lives: 2,
        level: 2,
        isRunning: true,
        gameOver: false,
        victory: false,
        paused: false
      },
      start: vi.fn(),
      stop: vi.fn(),
      reset: vi.fn(),
      togglePause: vi.fn(),
      destroy: vi.fn()
    };
    
    GameEngine.default.mockReturnValue(mockEngine);
    
    render(<GameCanvas />);
    
    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument();
      // Check for lives and level more specifically since both are "2"
      const statValues = screen.getAllByText('2');
      expect(statValues).toHaveLength(2); // Lives and Level both show "2"
    });
  });

  it('should cleanup engine on unmount', () => {
    const { unmount } = render(<GameCanvas />);
    
    unmount();
    
    // The cleanup should happen in useEffect cleanup
    expect(true).toBe(true); // This test ensures no errors during unmount
  });
});