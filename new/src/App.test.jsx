import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  // Update test to match actual app content instead of generic "learn react"
  const element = screen.getByText(/Wood Chopping Game/i);
  expect(element).toBeInTheDocument();
});
