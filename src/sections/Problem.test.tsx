import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Problem } from './Problem'
import { copy } from '../data/copy'

describe('Problem', () => {
  it('names the visitor situation in a few lines', () => {
    render(<Problem />)
    expect(screen.getByRole('heading', { name: copy.problem.title })).toBeInTheDocument()
    expect(screen.getByText(copy.problem.text)).toBeInTheDocument()
  })
})