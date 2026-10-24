import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServiceCard } from './ServiceCard'
import { services } from '../data/services'
import { copy } from '../data/copy'

const landing = services.find((service) => service.id === 'landing')!

describe('ServiceCard', () => {
  it('renders the service name and audience', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByRole('heading', { name: landing.name })).toBeInTheDocument()
    expect(screen.getByText(landing.audience)).toBeInTheDocument()
  })

  it('renders the included items and what it needs from the client', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByText('Incluye')).toBeInTheDocument()
    expect(screen.getByText(copy.services.requiresLabel)).toBeInTheDocument()
    for (const item of landing.includes) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
    for (const item of landing.requires) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('renders the timeline', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByText(`Plazo: ${landing.timeline}`)).toBeInTheDocument()
  })

  it('does not render any price', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.queryByText(/USD|ARS|Desde/)).toBeNull()
  })

  it('links the CTA to the quote request form', () => {
    render(<ServiceCard service={landing} />)
    const cta = screen.getByRole('link', { name: 'Pedir presupuesto' })
    expect(cta).toHaveAttribute('href', '#estimador')
  })
})
