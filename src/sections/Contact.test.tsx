import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'
import { profile } from '../data/profile'

describe('Contact', () => {
  it('renders the section heading', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: '¿Hablamos?' })).toBeInTheDocument()
  })

  it('renders an email link using the profile email', () => {
    render(<Contact />)
    const emailLink = screen.getByRole('link', { name: 'Enviar email' })
    expect(emailLink).toHaveAttribute('href', `mailto:${profile.email}`)
  })

  it('renders links to GitHub and LinkedIn from the profile', () => {
    render(<Contact />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    expect(githubLink).toHaveAttribute('href', profile.socialLinks.github)
    expect(linkedinLink).toHaveAttribute('href', profile.socialLinks.linkedin)
  })

  it('renders social links from the others list when present', () => {
    const others = [{ label: 'Twitter', url: 'https://twitter.com/usuario' }]
    const original = profile.socialLinks.others
    profile.socialLinks.others = others
    render(<Contact />)
    const twitterLink = screen.getByRole('link', { name: 'Twitter' })
    expect(twitterLink).toHaveAttribute('href', others[0].url)
    profile.socialLinks.others = original
  })
})
