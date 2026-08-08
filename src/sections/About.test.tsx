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
      expect(screen.getAllByText(item.title).length).toBeGreaterThan(0)
      expect(screen.getAllByText(item.organization).length).toBeGreaterThan(0)
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

  it('renders certifications in a timeline', () => {
    render(<About />)
    expect(screen.getByRole('heading', { name: 'Certificaciones' })).toBeInTheDocument()
    for (const item of experience.certifications) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
    }
    const aluraCount = experience.certifications.filter(
      (item) => item.organization === 'Alura'
    ).length
    expect(screen.getAllByText('Alura')).toHaveLength(aluraCount)
    expect(screen.getByText('Oracle Next Education + Alura')).toBeInTheDocument()
    expect(screen.getByText('Certificación C#')).toBeInTheDocument()
  })
})
