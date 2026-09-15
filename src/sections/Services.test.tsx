import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Services } from './Services'
import { services } from '../data/services'
import { copy } from '../data/copy'

describe('Services', () => {
  it('renders the section heading', () => {
    render(<Services />)
    expect(screen.getByRole('heading', { name: copy.services.title })).toBeInTheDocument()
  })

  it('renders both services with visible prices', () => {
    render(<Services />)
    for (const service of services) {
      expect(screen.getByRole('heading', { level: 3, name: service.name })).toBeInTheDocument()
      expect(screen.getByText(service.priceFrom)).toBeInTheDocument()
    }
  })

  it('offers help choosing and a WhatsApp CTA without duplicating the section', () => {
    render(<Services />)
    expect(screen.getByText(copy.services.unsureText)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: copy.services.ctaLabel }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Ver detalle completo' })).not.toBeInTheDocument()
  })
})