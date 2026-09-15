import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServiceCard } from './ServiceCard'
import { services } from '../data/services'

const landing = services.find((service) => service.id === 'landing')!

describe('ServiceCard', () => {
  it('renders the service name and audience', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByRole('heading', { name: landing.name })).toBeInTheDocument()
    expect(screen.getByText(landing.audience)).toBeInTheDocument()
  })

  it('renders the included and excluded items', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByText('Incluye')).toBeInTheDocument()
    expect(screen.getByText('No incluye')).toBeInTheDocument()
    for (const item of landing.includes) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
    for (const item of landing.excludes) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('renders the timeline and the price', () => {
    render(<ServiceCard service={landing} />)
    expect(screen.getByText(`Plazo: ${landing.timeline}`)).toBeInTheDocument()
    expect(screen.getByText('Desde')).toBeInTheDocument()
    expect(screen.getByText(landing.priceFrom)).toBeInTheDocument()
  })

  it('renders a WhatsApp CTA with the service-specific message', () => {
    render(<ServiceCard service={landing} />)
    const cta = screen.getByRole('link', { name: 'Pedir presupuesto' })
    expect(cta).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('una landing')))
  })
})