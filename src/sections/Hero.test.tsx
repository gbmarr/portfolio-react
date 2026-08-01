import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { profile } from '../data/profile'

describe('Hero', () => {
  it('renders the name as the main heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name)
  })

  it('renders the role', () => {
    render(<Hero />)
    expect(screen.getByText(profile.role)).toBeInTheDocument()
  })

  it('renders the bio as the tagline', () => {
    render(<Hero />)
    expect(screen.getByText(profile.bio)).toBeInTheDocument()
  })

  it('renders call-to-action buttons linking to projects and contact', () => {
    render(<Hero />)
    const projectsLink = screen.getByRole('link', { name: 'Ver proyectos' })
    const contactLink = screen.getByRole('link', { name: 'Contáctame' })
    expect(projectsLink).toHaveAttribute('href', '#proyectos')
    expect(contactLink).toHaveAttribute('href', '#contacto')
  })
})
