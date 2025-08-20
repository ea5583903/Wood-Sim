import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App.jsx';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders doughnut dash platformer title', () => {
    render(<App />);
    const titleElement = screen.getByText(/🍩 Doughnut Dash Platformer/i);
    expect(titleElement).toBeInTheDocument();
  });

  it('shows welcome overlay for new players', () => {
    render(<App />);
    const welcomeElement = screen.getByText(/Welcome to Doughnut Dash Platformer!/i);
    expect(welcomeElement).toBeInTheDocument();
  });

  it('does not show welcome overlay for returning players', () => {
    localStorage.setItem('doughnutPlatformerPlayed', 'true');
    render(<App />);
    const welcomeElement = screen.queryByText(/Welcome to Doughnut Dash Platformer!/i);
    expect(welcomeElement).not.toBeInTheDocument();
  });
});
