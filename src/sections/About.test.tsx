import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { About } from './About'
import { profile } from '../data/profile'
import { experience } from '../data/experience'
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

  it('renders the English bio, experience and certifications when the language is English', () => {
    setBrowserLanguage('en-US')
    render(
      <LanguageProvider>
        <About />
      </LanguageProvider>
    )
    expect(screen.getByText(content.en.profile.bio)).toBeInTheDocument()
    expect(screen.getByText('MVP Development')).toBeInTheDocument()
    expect(screen.getAllByText('Fullstack Developer')).toHaveLength(2)
    expect(
      screen.getByText('University Technician in Information Technology Application Development')
    ).toBeInTheDocument()
    expect(screen.getByText('In progress.')).toBeInTheDocument()
    expect(screen.getByText('Frontend Developer Program')).toBeInTheDocument()
    expect(screen.getByText('C# Certification')).toBeInTheDocument()
  })
})
