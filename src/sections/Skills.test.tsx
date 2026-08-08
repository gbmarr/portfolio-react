import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skills } from './Skills'
import { skills } from '../data/skills'
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

describe('Skills', () => {
  it('renders the section heading', () => {
    render(<Skills />)
    expect(screen.getByRole('heading', { name: 'Tecnologías y herramientas' })).toBeInTheDocument()
  })

  it('renders a card for each skill category', () => {
    render(<Skills />)
    for (const category of skills) {
      expect(screen.getByRole('heading', { name: category.category })).toBeInTheDocument()
    }
  })

  it('renders each skill with its proficiency level', () => {
    render(<Skills />)
    for (const category of skills) {
      for (const skill of category.skills) {
        expect(screen.getByText(skill.name)).toBeInTheDocument()
      }
    }
    const levelLabels: Record<string, string> = {
      beginner: 'Nivel principiante',
      intermediate: 'Nivel intermedio',
      advanced: 'Nivel avanzado',
    }
    const levelsUsed = new Set(
      skills.flatMap((category) => category.skills.map((skill) => skill.level))
    )
    for (const level of levelsUsed) {
      expect(screen.getAllByLabelText(levelLabels[level]).length).toBeGreaterThan(0)
    }
  })

  it('renders English category labels when the language is English', () => {
    setBrowserLanguage('en-US')
    render(
      <LanguageProvider>
        <Skills />
      </LanguageProvider>
    )
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Backend' })).toBeInTheDocument()
  })
})
