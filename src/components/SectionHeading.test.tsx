import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHeading } from './SectionHeading'

describe('SectionHeading', () => {
  it('renders the title as a heading', () => {
    render(<SectionHeading title="Mis proyectos" />)
    const heading = screen.getByRole('heading', { name: 'Mis proyectos' })
    expect(heading).toBeInTheDocument()
  })

  it('renders the eyebrow label when provided', () => {
    render(<SectionHeading title="Título" eyebrow="Portfolio" />)
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    render(<SectionHeading title="Título" subtitle="Un subtítulo" />)
    expect(screen.getByText('Un subtítulo')).toBeInTheDocument()
  })

  it('does not render an eyebrow when absent', () => {
    render(<SectionHeading title="Título" />)
    expect(screen.queryByText('Portfolio')).not.toBeInTheDocument()
  })
})
