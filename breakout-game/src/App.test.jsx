import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App.jsx';

// Mock GameCanvas component
vi.mock('./GameCanvas', () => ({
  default: () => <div data-testid="game-canvas">Mocked GameCanvas</div>
}));

describe('App', () => {
  it('should render the GameCanvas component', () => {
    render(<App />);
    
    const gameCanvas = screen.getByTestId('game-canvas');
    expect(gameCanvas).toBeInTheDocument();
  });

  it('should have the App class', () => {
    const { container } = render(<App />);
    
    const appDiv = container.firstChild;
    expect(appDiv).toHaveClass('App');
  });
});
