import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ServicesPreview } from './ServicesPreview'
import { services } from '../data/services'
import { copy } from '../data/copy'

describe('ServicesPreview', () => {
  it('renders the section heading', () => {
    render(<ServicesPreview />)
    expect(screen.getByRole('heading', { name: copy.services.title })).toBeInTheDocument()
  })

  it('renders both services with visible prices', () => {
    render(<ServicesPreview />)
    for (const service of services) {
      expect(screen.getByRole('heading', { level: 3, name: service.name })).toBeInTheDocument()
      expect(screen.getByText(service.priceFrom)).toBeInTheDocument()
    }
  })

  it('links to the detail section', () => {
    render(<ServicesPreview />)
    const link = screen.getByRole('link', { name: copy.services.detailLabel })
    expect(link).toHaveAttribute('href', '#servicios-detalle')
  })
})