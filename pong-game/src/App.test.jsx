import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App.jsx';

// Mock the PongGame component
vi.mock('./PongGame', () => ({
  default: () => <div data-testid="pong-game">Pong Game Component</div>
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the PongGame component', () => {
    render(<App />);
    expect(screen.getByTestId('pong-game')).toBeInTheDocument();
  });

  it('should have the App class', () => {
    render(<App />);
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });
});
