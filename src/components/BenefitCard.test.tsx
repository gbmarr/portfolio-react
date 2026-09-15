import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BenefitCard } from './BenefitCard'
import { benefits } from '../data/benefits'

const first = benefits[0]

describe('BenefitCard', () => {
  it('renders the benefit title and description', () => {
    render(<BenefitCard benefit={first} />)
    expect(screen.getByRole('heading', { name: first.title })).toBeInTheDocument()
    expect(screen.getByText(first.description)).toBeInTheDocument()
  })

  it('renders a decorative icon (aria-hidden, no img role)', () => {
    const { container } = render(<BenefitCard benefit={first} />)
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
