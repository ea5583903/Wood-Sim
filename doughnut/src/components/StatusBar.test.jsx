import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBar from './StatusBar.jsx';

describe('StatusBar', () => {
  const mockShop = {
    cash: 125.50,
    reputation: 75
  };

  const mockStats = {
    totalCustomers: 10,
    satisfiedCustomers: 8,
    lostCustomers: 2
  };

  it('should render cash amount correctly', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={2} 
        currentTick={30} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('$125.50')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
  });

  it('should render reputation correctly', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={2} 
        currentTick={30} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Reputation')).toBeInTheDocument();
  });

  it('should render customer statistics', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={2} 
        currentTick={30} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Served')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
  });

  it('should calculate and display success rate correctly', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={2} 
        currentTick={30} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('80.0%')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
  });

  it('should handle zero customers gracefully', () => {
    const emptyStats = {
      totalCustomers: 0,
      satisfiedCustomers: 0,
      lostCustomers: 0
    };

    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={1} 
        currentTick={0} 
        stats={emptyStats} 
      />
    );
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('should render day and tick information', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={3} 
        currentTick={45} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('Day 3')).toBeInTheDocument();
    expect(screen.getByText('Tick 45/60')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={2} 
        currentTick={30} 
        stats={mockStats} 
      />
    );
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveStyle('width: 50%'); // 30/60 * 100
  });

  it('should handle edge case with maximum tick', () => {
    render(
      <StatusBar 
        shop={mockShop} 
        currentDay={1} 
        currentTick={60} 
        stats={mockStats} 
      />
    );
    
    const progressFill = document.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle('width: 100%');
  });

  it('should format cash with two decimal places', () => {
    const shopWithWholeNumber = { cash: 100, reputation: 50 };
    
    render(
      <StatusBar 
        shop={shopWithWholeNumber} 
        currentDay={1} 
        currentTick={0} 
        stats={mockStats} 
      />
    );
    
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });
});