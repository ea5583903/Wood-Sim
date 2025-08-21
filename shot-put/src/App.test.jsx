import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  // Update test to match actual app content instead of generic "learn react"
  const element = screen.getByText(/Shot-Put Shooting Game/i);
  expect(element).toBeInTheDocument();
});
