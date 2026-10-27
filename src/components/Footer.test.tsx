import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'
import { profile } from '../data/profile'
import { copy } from '../data/copy'
import { argentinaYear } from '../lib/format'

describe('Footer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the tagline', () => {
    render(<Footer />)
    expect(screen.getByText(copy.footer.tagline)).toBeInTheDocument()
  })

  it('renders the copyright notice with the Argentina year and name', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2027-01-01T02:00:00Z'))
    render(<Footer />)
    expect(argentinaYear()).toBe(2026)
    expect(screen.getByText(`© 2026 ${profile.name}. ${copy.footer.rights}`)).toBeInTheDocument()
  })

  it('renders a footer landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders a discreet client access link to /login', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: copy.footer.clientAccess })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('renders links to the privacy policy and terms', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: copy.legal.privacy })).toHaveAttribute(
      'href',
      '/privacidad'
    )
    expect(screen.getByRole('link', { name: copy.legal.terms })).toHaveAttribute(
      'href',
      '/terminos'
    )
  })
})
