import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Cases } from './Cases'
import { cases } from '../data/cases'
import { copy } from '../data/copy'

describe('Cases', () => {
  it('renders every case study with context', () => {
    render(<Cases />)
    expect(screen.getByRole('heading', { name: copy.cases.title })).toBeInTheDocument()
    for (const caseStudy of cases) {
      expect(screen.getByRole('heading', { level: 3, name: caseStudy.title })).toBeInTheDocument()
    }
  })

  it('declares the honesty note and does not duplicate the section', () => {
    render(<Cases />)
    expect(screen.getByText(copy.cases.honestyNote)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Ver todos los casos' })).not.toBeInTheDocument()
  })
})