import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'
import { profile } from '../data/profile'

describe('Footer', () => {
  it('renders the copyright notice with the current year and name', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} ${profile.name}`)).toBeInTheDocument()
  })

  it('renders a footer landmark', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
