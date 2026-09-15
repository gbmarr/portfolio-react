import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HowItWorks } from './HowItWorks'
import { processSteps } from '../data/process'
import { copy } from '../data/copy'

describe('HowItWorks', () => {
  it('renders the numbered steps', () => {
    render(<HowItWorks />)
    expect(screen.getByRole('heading', { name: copy.process.title })).toBeInTheDocument()
    for (const step of processSteps) {
      expect(screen.getByText(step.title)).toBeInTheDocument()
    }
  })
})