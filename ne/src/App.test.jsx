import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  // Update test to match actual app content - this app has empty div so check for App class
  const element = document.querySelector('.App');
  expect(element).toBeInTheDocument();
});
