import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Projects } from './Projects'
import { projects } from '../data/projects'

describe('Projects', () => {
  it('renders the section heading', () => {
    render(<Projects />)
    expect(screen.getByRole('heading', { name: 'Algunos de mis proyectos' })).toBeInTheDocument()
  })

  it('renders a card for every project', () => {
    render(<Projects />)
    for (const project of projects) {
      expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument()
    }
  })

  it('renders a repository link only for projects that have one', () => {
    render(<Projects />)
    const projectsWithRepo = projects.filter((project) => project.repoUrl)
    const repoLinks = screen.queryAllByRole('link', { name: /Código/ })
    expect(repoLinks).toHaveLength(projectsWithRepo.length)
  })

  it('renders a demo link only for projects that have one', () => {
    render(<Projects />)
    const projectsWithDemo = projects.filter((project) => project.demoUrl)
    const demoLinks = screen.getAllByRole('link', { name: /Demo/ })
    expect(demoLinks).toHaveLength(projectsWithDemo.length)
  })
})
