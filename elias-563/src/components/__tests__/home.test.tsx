import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByText('Elias 563')).toBeInTheDocument()
    expect(screen.getByText('Your Complete Office Suite')).toBeInTheDocument()
  })

  it('renders all office apps', () => {
    render(<Home />)
    expect(screen.getByText('Word')).toBeInTheDocument()
    expect(screen.getByText('Excel')).toBeInTheDocument()
    expect(screen.getByText('PowerPoint')).toBeInTheDocument()
    expect(screen.getByText('Mail')).toBeInTheDocument()
    expect(screen.getByText('Teams')).toBeInTheDocument()
    expect(screen.getByText('Files')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<Home />)
    expect(screen.getByText('Fast & Modern')).toBeInTheDocument()
    expect(screen.getByText('Cloud-First')).toBeInTheDocument()
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument()
  })
})