import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServicesDetail } from './ServicesDetail'
import { services } from '../data/services'
import { copy } from '../data/copy'

describe('ServicesDetail', () => {
  it('renders all services in detail', () => {
    render(<ServicesDetail />)
    for (const service of services) {
      expect(screen.getByRole('heading', { level: 3, name: service.name })).toBeInTheDocument()
      expect(screen.getByText(service.priceFrom)).toBeInTheDocument()
    }
  })

  it('offers help choosing and a WhatsApp CTA', () => {
    render(<ServicesDetail />)
    expect(screen.getByText(copy.services.unsureText)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: copy.services.ctaLabel }).length).toBeGreaterThan(0)
  })
})