import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Container } from './Container'

describe('Container', () => {
  it('renders its children', () => {
    render(
      <Container>
        <p>Contenido del contenedor</p>
      </Container>
    )
    expect(screen.getByText('Contenido del contenedor')).toBeInTheDocument()
  })

  it('applies the layout classes and extra className', () => {
    render(
      <Container className="custom-class">
        <p>Contenido</p>
      </Container>
    )
    const container = screen.getByText('Contenido').parentElement
    expect(container).toHaveClass('max-w-5xl')
    expect(container).toHaveClass('custom-class')
  })
})
