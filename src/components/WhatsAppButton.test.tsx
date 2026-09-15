import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WhatsAppButton } from './WhatsAppButton'

describe('WhatsAppButton', () => {
  it('renders a wa.me link with a predefined message', () => {
    render(<WhatsAppButton />)
    const link = screen.getByRole('link', { name: 'Escribime por WhatsApp' })
    expect(link).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/\d+\?text=/))
  })

  it('uses the service-specific message when a serviceId is provided', () => {
    render(<WhatsAppButton serviceId="landing" />)
    const link = screen.getByRole('link', { name: 'Escribime por WhatsApp' })
    expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('una landing')))
  })

  it('uses the custom label when provided', () => {
    render(<WhatsAppButton label="Pedir presupuesto" />)
    expect(screen.getByRole('link', { name: 'Pedir presupuesto' })).toBeInTheDocument()
  })
})