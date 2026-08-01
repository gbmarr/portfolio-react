import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Section } from './Section'

describe('Section', () => {
  it('renders a section element with its children', () => {
    const { container } = render(
      <Section>
        <p>Contenido</p>
      </Section>,
    )
    const section = container.querySelector('section')
    expect(section).not.toBeNull()
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('renders the provided id for anchor navigation', () => {
    const { container } = render(
      <Section id="proyectos">
        <p>Contenido</p>
      </Section>,
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'proyectos')
  })

  it('applies the section spacing classes', () => {
    const { container } = render(
      <Section>
        <p>Contenido</p>
      </Section>,
    )
    const section = container.querySelector('section')
    expect(section).toHaveClass('py-20')
  })
})
