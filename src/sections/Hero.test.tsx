import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { profile } from '../data/profile'
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

describe('Hero', () => {
  it('renders the name as the main heading', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name)
  })

  it('renders the role', () => {
    render(<Hero />)
    expect(screen.getByText(profile.role)).toBeInTheDocument()
  })

  it('renders the tagline as the hero intro', () => {
    render(<Hero />)
    expect(screen.getByText(profile.tagline!)).toBeInTheDocument()
  })

  it('renders the profile photo when available', () => {
    render(<Hero />)
    const photo = screen.getByRole('img', { name: 'Foto de perfil' })
    expect(photo).toHaveAttribute('src', profile.photo)
    expect(photo).toHaveAttribute('alt', 'Foto de perfil')
  })

  it('renders call-to-action buttons linking to projects and contact', () => {
    render(<Hero />)
    const projectsLink = screen.getByRole('link', { name: 'Ver proyectos' })
    const contactLink = screen.getByRole('link', { name: 'Contáctame' })
    expect(projectsLink).toHaveAttribute('href', '#proyectos')
    expect(contactLink).toHaveAttribute('href', '#contacto')
  })

  it('renders the English role and tagline when the language is English', () => {
    setBrowserLanguage('en-US')
    render(
      <LanguageProvider>
        <Hero />
      </LanguageProvider>
    )
    expect(screen.getByText(content.en.profile.role)).toBeInTheDocument()
    expect(screen.getByText(content.en.profile.tagline)).toBeInTheDocument()
  })
})
