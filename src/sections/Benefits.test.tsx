import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Benefits } from './Benefits'
import { benefits } from '../data/benefits'
import { industries } from '../data/industries'
import { copy } from '../data/copy'

describe('Benefits', () => {
  it('renders the benefits section heading', () => {
    render(<Benefits />)
    expect(screen.getByRole('heading', { name: copy.benefits.title })).toBeInTheDocument()
  })

  it('renders every benefit with its title', () => {
    render(<Benefits />)
    for (const benefit of benefits) {
      expect(screen.getByRole('heading', { level: 3, name: benefit.title })).toBeInTheDocument()
    }
  })

  it('lists the industries grouped by category for identification', () => {
    render(<Benefits />)
    expect(screen.getByRole('heading', { name: copy.industries.title })).toBeInTheDocument()
    for (const group of industries) {
      expect(screen.getByRole('heading', { level: 3, name: group.label })).toBeInTheDocument()
      for (const item of group.items) {
        expect(screen.getByText(item)).toBeInTheDocument()
      }
    }
  })
})
