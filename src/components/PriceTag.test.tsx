import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriceTag } from './PriceTag'

describe('PriceTag', () => {
  it('renders the price and the optional label', () => {
    render(<PriceTag price="USD 250" label="Desde" />)
    expect(screen.getByText('Desde')).toBeInTheDocument()
    expect(screen.getByText('USD 250')).toBeInTheDocument()
  })

  it('renders only the price when there is no label', () => {
    render(<PriceTag price="USD 250" />)
    expect(screen.getByText('USD 250')).toBeInTheDocument()
  })
})