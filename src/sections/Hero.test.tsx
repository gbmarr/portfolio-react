import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { copy } from '../data/copy'

describe('Hero', () => {
  it('states what I sell in plain language', () => {
    render(<Hero />)
    expect(
      screen.getByRole('heading', { level: 1, name: copy.hero.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(copy.hero.subtitle)).toBeInTheDocument()
  })

  it('renders a single WhatsApp-based primary CTA', () => {
    render(<Hero />)
    const primary = screen.getByRole('link', { name: copy.hero.ctaPrimary })
    expect(primary).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//))
  })

  it('shows a secondary link to the work samples', () => {
    render(<Hero />)
    const secondary = screen.getByRole('link', { name: copy.hero.ctaSecondary })
    expect(secondary).toHaveAttribute('href', '#trabajos')
  })

  it('shows a decorative mockup illustration instead of heavy screenshots', () => {
    const { container } = render(<Hero />)
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})