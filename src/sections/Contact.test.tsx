import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Contact } from './Contact'
import { profile } from '../data/profile'
import { copy } from '../data/copy'

describe('Contact', () => {
  it('renders the section heading', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: copy.contact.title })).toBeInTheDocument()
  })

  it('sets the response expectation', () => {
    render(<Contact />)
    expect(screen.getByText(copy.contact.responseTime)).toBeInTheDocument()
  })

  it('renders a WhatsApp link with the predefined message', () => {
    render(<Contact />)
    const whatsapp = screen.getByRole('link', { name: copy.contact.whatsappLabel })
    expect(whatsapp).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/))
  })

  it('renders an email fallback link using the profile email', () => {
    render(<Contact />)
    const emailLink = screen.getByRole('link', { name: copy.contact.sendEmail })
    expect(emailLink).toHaveAttribute('href', `mailto:${profile.email}`)
  })

  it('renders the short contact form', () => {
    render(<Contact />)
    expect(screen.getByLabelText('Tu nombre')).toBeInTheDocument()
    expect(screen.getByLabelText('Tu email o WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Contame qué necesitás')).toBeInTheDocument()
  })
})