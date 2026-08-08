import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Timeline } from './Timeline'
import type { ExperienceItem } from '../data/types'

const sampleItems: ExperienceItem[] = [
  {
    id: 'frontend-dev',
    title: 'Desarrollador Frontend',
    organization: 'TechCorp',
    startDate: '2025-01',
    endDate: 'Presente',
    achievements: ['Lancé una aplicación interna con React.'],
  },
  {
    id: 'computer-science-degree',
    title: 'Grado en Ingeniería Informática',
    organization: 'Universidad X',
    startDate: '2020-09',
    endDate: '2024-06',
    achievements: [],
  },
]

describe('Timeline', () => {
  it('renders the timeline title', () => {
    render(<Timeline title="Experiencia" items={sampleItems} />)
    expect(screen.getByRole('heading', { name: 'Experiencia' })).toBeInTheDocument()
  })

  it('renders each item with title, organization and dates', () => {
    render(<Timeline title="Experiencia" items={sampleItems} />)
    expect(screen.getByText('Desarrollador Frontend')).toBeInTheDocument()
    expect(screen.getByText('TechCorp')).toBeInTheDocument()
    expect(screen.getByText('2025-01 — Presente')).toBeInTheDocument()
    expect(screen.getByText('Grado en Ingeniería Informática')).toBeInTheDocument()
  })

  it('renders achievements when present', () => {
    render(<Timeline title="Experiencia" items={sampleItems} />)
    expect(screen.getByText('Lancé una aplicación interna con React.')).toBeInTheDocument()
  })

  it('omits the dates line when startDate is absent', () => {
    const itemWithoutDate: ExperienceItem = {
      id: 'react-training',
      title: 'Formación React',
      organization: 'Alura',
      achievements: [],
    }
    render(<Timeline title="Certificaciones" items={[itemWithoutDate]} />)
    expect(screen.getByText('Formación React')).toBeInTheDocument()
    expect(screen.queryByText(/\d{4}-\d{2} —/)).not.toBeInTheDocument()
  })

  it('does not render a timeline when there are no items', () => {
    render(<Timeline title="Certificaciones" items={[]} />)
    expect(screen.queryByRole('heading', { name: 'Certificaciones' })).not.toBeInTheDocument()
  })
})
