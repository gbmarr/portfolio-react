import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CasesDetail } from './CasesDetail'
import { cases } from '../data/cases'
import { copy } from '../data/copy'

describe('CasesDetail', () => {
  it('renders every case study', () => {
    render(<CasesDetail />)
    for (const caseStudy of cases) {
      expect(screen.getByRole('heading', { level: 3, name: caseStudy.title })).toBeInTheDocument()
    }
  })

  it('declares the honesty note', () => {
    render(<CasesDetail />)
    expect(screen.getByText(copy.cases.honestyNote)).toBeInTheDocument()
  })
})