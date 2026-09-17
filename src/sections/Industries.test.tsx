import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Industries } from './Industries'
import { industries } from '../data/industries'
import { copy } from '../data/copy'

describe('Industries', () => {
  it('renders the industries section heading', () => {
    render(<Industries />)
    expect(screen.getByRole('heading', { name: copy.industries.title })).toBeInTheDocument()
  })

  it(
    'renders every industry group with its items',
    () => {
      render(<Industries />)
      for (const group of industries) {
        expect(screen.getByRole('heading', { level: 3, name: group.label })).toBeInTheDocument()
        for (const item of group.items) {
          expect(screen.getByRole('button', { name: item.name })).toBeInTheDocument()
        }
      }
    },
    15_000,
  )

  it('hides the per-industry benefits by default', () => {
    render(<Industries />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})