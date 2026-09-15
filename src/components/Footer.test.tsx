import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'
import { profile } from '../data/profile'
import { copy } from '../data/copy'

describe('Footer', () => {
  it('renders the tagline', () => {
    render(<Footer />)
    expect(screen.getByText(copy.footer.tagline)).toBeInTheDocument()
  })

  it('renders the copyright notice with the current year and name', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(
      screen.getByText(`© ${year} ${profile.name}. ${copy.footer.rights}`)
    ).toBeInTheDocument()
  })

  it('renders a footer landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
