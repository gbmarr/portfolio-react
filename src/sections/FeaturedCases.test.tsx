import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeaturedCases } from './FeaturedCases'
import { cases } from '../data/cases'
import { copy } from '../data/copy'

describe('FeaturedCases', () => {
  it('renders the sample cases with context', () => {
    render(<FeaturedCases />)
    expect(screen.getByRole('heading', { name: copy.cases.title })).toBeInTheDocument()
    for (const caseStudy of cases.slice(0, 3)) {
      expect(screen.getByRole('heading', { level: 3, name: caseStudy.title })).toBeInTheDocument()
    }
  })

  it('links to the details section', () => {
    render(<FeaturedCases />)
    const link = screen.getByRole('link', { name: copy.cases.viewAll })
    expect(link).toHaveAttribute('href', '#trabajos-detalle')
  })
})