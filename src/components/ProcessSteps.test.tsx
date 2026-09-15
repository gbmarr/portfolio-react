import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProcessSteps } from './ProcessSteps'
import { processSteps } from '../data/process'

describe('ProcessSteps', () => {
  it('renders a numbered step for every item in order', () => {
    render(<ProcessSteps steps={processSteps} />)
    processSteps.forEach((step, index) => {
      expect(screen.getByText(step.title)).toBeInTheDocument()
      expect(screen.getByText(step.description)).toBeInTheDocument()
      expect(screen.getByText(String(index + 1))).toBeInTheDocument()
    })
  })
})