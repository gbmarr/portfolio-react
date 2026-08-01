import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { About } from './About'
import { profile } from '../data/profile'
import { experience } from '../data/experience'

describe('About', () => {
  it('renders the section heading', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: 'Mi trayectoria' })).toBeInTheDocument()
  })

  it('renders the bio', () => {
    render(<About />)
    expect(screen.getByText(profile.bio)).toBeInTheDocument()
  })

  it('renders work experience in a timeline', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: 'Experiencia' })).toBeInTheDocument()
    for (const item of experience.work) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.organization)).toBeInTheDocument()
    }
  })

  it('renders education in a timeline', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: 'Educación' })).toBeInTheDocument()
    for (const item of experience.education) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.organization)).toBeInTheDocument()
    }
  })
})
