import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Projects } from './Projects'
import { projects } from '../data/projects'
import { content } from '../data/content'
import { LanguageProvider } from '../i18n/LanguageContext'

const originalLanguage = window.navigator.language

function setBrowserLanguage(language: string) {
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    value: language,
  })
}

afterEach(() => {
  setBrowserLanguage(originalLanguage)
})

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

  it('renders a role badge for every project that has a role', () => {
    render(<Projects />)
    const projectsWithRole = projects.filter((project) => project.role)
    const roleBadges = screen.getAllByText(
      /Proyecto propio|Proyecto en sociedad|Colaboración en equipo/
    )
    expect(roleBadges).toHaveLength(projectsWithRole.length)
  })

  it('renders English descriptions when the language is English', () => {
    setBrowserLanguage('en-US')
    render(
      <LanguageProvider>
        <Projects />
      </LanguageProvider>
    )
    for (const project of projects) {
      expect(screen.getByText(content.en.projects[project.id])).toBeInTheDocument()
    }
  })
})
