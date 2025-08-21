import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import App from './App.jsx'

describe('App Component', () => {
  let windowOpenSpy

  beforeEach(() => {
    windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
  })

  afterEach(() => {
    windowOpenSpy.mockRestore()
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
    
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<App />)
    
    const copyButtons = screen.getAllByText('📋 Copy Command')
    fireEvent.click(copyButtons[0]) // First game
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('cd ../Black_jack && PORT=3001 npm start')
    expect(alertSpy).toHaveBeenCalled()
    
    alertSpy.mockRestore()
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
