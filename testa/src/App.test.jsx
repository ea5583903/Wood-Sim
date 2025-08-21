import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App.jsx'

describe('App Component', () => {
  let windowOpenSpy
  let alertSpy

  beforeEach(() => {
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
    alertSpy.mockRestore()
  })

  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('🎮 Elia\'s Game Hub')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    render(<App />)
    expect(screen.getByText('Collection of games built with Claude!')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByText('All games created collaboratively with Claude AI')).toBeInTheDocument()
  })

  it('renders all game cards', () => {
    render(<App />)
    
    const expectedGames = [
      'Blackjack & Go Fish',
      'Pong Game',
      'Doughnut Dash Platformer',
      'Breakout Game',
      'UNO Online',
      'Trading Game',
      'Music Game',
      'Shot Put',
      'Chat App'
    ]

    expectedGames.forEach(gameName => {
      expect(screen.getByText(gameName)).toBeInTheDocument()
    })
  })

  it('renders game descriptions', () => {
    render(<App />)
    
    expect(screen.getByText('Classic card games - play Blackjack or switch to Go Fish!')).toBeInTheDocument()
    expect(screen.getByText('Classic arcade Pong with debug mode and full game')).toBeInTheDocument()
    expect(screen.getByText('Jump, run, and collect doughnuts in this exciting platformer!')).toBeInTheDocument()
  })

  it('renders game emojis', () => {
    render(<App />)
    
    const gameCards = screen.getAllByRole('generic').filter(el => 
      el.className === 'game-card'
    )
    
    expect(gameCards).toHaveLength(9)
  })

  it('renders game paths', () => {
    render(<App />)
    
    expect(screen.getByText('📁 ../Black_jack')).toBeInTheDocument()
    expect(screen.getByText('📁 ../pong-game')).toBeInTheDocument()
    expect(screen.getByText('📁 ../doughnut')).toBeInTheDocument()
  })

  it('opens game links when play buttons are clicked', () => {
    render(<App />)
    
    const playButtons = screen.getAllByText('🚀 Play Game')
    fireEvent.click(playButtons[0]) // First game (Blackjack)
    
    expect(windowOpenSpy).toHaveBeenCalledWith('http://localhost:3001', '_blank')
  })

  it('opens different ports for different games', () => {
    render(<App />)
    
    const playButtons = screen.getAllByText('🚀 Play Game')
    fireEvent.click(playButtons[1]) // Second game (Pong)
    
    expect(windowOpenSpy).toHaveBeenCalledWith('http://localhost:3002', '_blank')
  })

  it('renders play and copy buttons for each game', () => {
    render(<App />)
    
    const playButtons = screen.getAllByText('🚀 Play Game')
    const copyButtons = screen.getAllByText('📋 Copy Command')
    
    expect(playButtons).toHaveLength(9)
    expect(copyButtons).toHaveLength(9)
  })

  it('copies command when copy button is clicked', () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
    Object.assign(navigator, { clipboard: mockClipboard })
    
    render(<App />)
    
    const copyButtons = screen.getAllByText('📋 Copy Command')
    fireEvent.click(copyButtons[0]) // First game
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('cd ../Black_jack && PORT=3001 npm start')
    expect(alertSpy).toHaveBeenCalled()
  })

  it('shows fallback alert when window.open fails', () => {
    // Mock window.open to return null (popup blocked)
    windowOpenSpy.mockImplementation(() => null)
    
    render(<App />)
    
    const playButtons = screen.getAllByText('🚀 Play Game')
    fireEvent.click(playButtons[0])
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('🎮 To play Blackjack & Go Fish:')
    )
  })

  it('handles clipboard API not available gracefully', () => {
    // Mock navigator.clipboard as undefined
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true
    })
    
    render(<App />)
    
    const copyButtons = screen.getAllByText('📋 Copy Command')
    fireEvent.click(copyButtons[0])
    
    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('💡 Run this command to start the game:')
    )
  })

  it('renders proper port numbers for each game', () => {
    render(<App />)
    
    const gameCards = document.querySelectorAll('.game-card')
    expect(gameCards).toHaveLength(9)
    
    // Check that each game has unique port assignment
    const playButtons = screen.getAllByText('🚀 Play Game')
    
    // Test first few games have correct ports
    fireEvent.click(playButtons[0]) // Blackjack - port 3001
    expect(windowOpenSpy).toHaveBeenLastCalledWith('http://localhost:3001', '_blank')
    
    fireEvent.click(playButtons[1]) // Pong - port 3002  
    expect(windowOpenSpy).toHaveBeenLastCalledWith('http://localhost:3002', '_blank')
    
    fireEvent.click(playButtons[2]) // Doughnut - port 3003
    expect(windowOpenSpy).toHaveBeenLastCalledWith('http://localhost:3003', '_blank')
  })

  it('has correct CSS classes applied', () => {
    render(<App />)
    
    const app = screen.getByText('🎮 Elia\'s Game Hub').closest('.App')
    expect(app).toHaveClass('App')
    
    const header = screen.getByText('🎮 Elia\'s Game Hub').closest('.App-header')
    expect(header).toHaveClass('App-header')
    
    const grid = screen.getByText('Blackjack & Go Fish').closest('.games-grid')
    expect(grid).toHaveClass('games-grid')
  })

  it('renders correct number of games', () => {
    render(<App />)
    
    const gameCards = document.querySelectorAll('.game-card')
    expect(gameCards).toHaveLength(9)
  })

  it('each game card has all required elements', () => {
    render(<App />)
    
    const firstGameCard = document.querySelector('.game-card')
    
    expect(firstGameCard.querySelector('.game-emoji')).toBeInTheDocument()
    expect(firstGameCard.querySelector('.game-name')).toBeInTheDocument()
    expect(firstGameCard.querySelector('.game-description')).toBeInTheDocument()
    expect(firstGameCard.querySelector('.game-path')).toBeInTheDocument()
  })
})
