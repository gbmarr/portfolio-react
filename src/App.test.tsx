import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { profile } from './data/profile'

describe('App', () => {
  it('renders the hero with the profile name as main heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name)
  })

  it('renders the navigation bar', () => {
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders all core sections', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 2, name: 'Mi trayectoria' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Tecnologías y herramientas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Algunos de mis proyectos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '¿Hablamos?' })).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
