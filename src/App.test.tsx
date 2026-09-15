import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'
import { copy } from './data/copy'

describe('App', () => {
  it('renders the hero with a clear value proposition', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.hero.title)
  })

  it('renders the navigation bar', () => {
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders the home page sections (resumen + detalle)', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 2, name: copy.problem.title })
    ).toBeInTheDocument()
    // Los títulos de servicios y casos aparecen dos veces: resumen y detalle.
    expect(
      screen.getAllByRole('heading', { level: 2, name: copy.services.title })
    ).toHaveLength(2)
    expect(
      screen.getAllByRole('heading', { level: 2, name: copy.cases.title })
    ).toHaveLength(2)
    expect(
      screen.getByRole('heading', { level: 2, name: copy.about.title })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: copy.faq.title })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: copy.cta.title })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: copy.contact.title })
    ).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<App />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})