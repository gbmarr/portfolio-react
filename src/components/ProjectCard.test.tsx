import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectCard } from './ProjectCard'
import type { Project } from '../data/types'

const project: Project = {
  id: 'mi-app',
  name: 'Mi App',
  description: 'Una aplicación de ejemplo',
  technologies: ['React', 'TypeScript'],
  demoUrl: 'https://demo.example.com',
  repoUrl: 'https://github.com/usuario/mi-app',
}

describe('ProjectCard', () => {
  it('renders the project name, description and technologies', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByRole('heading', { name: 'Mi App' })).toBeInTheDocument()
    expect(screen.getByText('Una aplicación de ejemplo')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders demo and repository links', () => {
    render(<ProjectCard project={project} />)
    const demo = screen.getByRole('link', { name: /Demo/i })
    expect(demo).toHaveAttribute('href', 'https://demo.example.com')
    const repo = screen.getByRole('link', { name: /Código/i })
    expect(repo).toHaveAttribute('href', 'https://github.com/usuario/mi-app')
  })

  it('omits the demo link when demoUrl is absent', () => {
    const projectWithoutDemo = { ...project, demoUrl: undefined }
    render(<ProjectCard project={projectWithoutDemo} />)
    expect(screen.queryByRole('link', { name: /Demo/i })).not.toBeInTheDocument()
  })

  it('omits the repository link when repoUrl is absent', () => {
    const projectWithoutRepo = { ...project, repoUrl: undefined }
    render(<ProjectCard project={projectWithoutRepo} />)
    expect(screen.queryByRole('link', { name: /Código/i })).not.toBeInTheDocument()
  })

  it('renders a placeholder with the project initials when there is no screenshot', () => {
    render(<ProjectCard project={project} />)
    expect(screen.getByText('MA')).toBeInTheDocument()
  })
})
