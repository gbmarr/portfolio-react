import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CTAFinal } from './CTAFinal'
import { copy } from '../data/copy'

describe('CTAFinal', () => {
  it('repeats the single action the visitor must take', () => {
    render(<CTAFinal />)
    expect(screen.getByRole('heading', { name: copy.cta.title })).toBeInTheDocument()
    const cta = screen.getByRole('link', { name: copy.cta.button })
    expect(cta).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//))
  })
})