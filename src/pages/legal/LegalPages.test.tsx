import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PrivacyPage } from './PrivacyPage'
import { TermsPage } from './TermsPage'
import { copy } from '../../data/copy'
import { profile } from '../../data/profile'

describe('páginas legales', () => {
  it('renderiza la política de privacidad con el responsable y los derechos', () => {
    render(
      <MemoryRouter initialEntries={['/privacidad']}>
        <PrivacyPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: copy.legal.privacy })
    ).toBeInTheDocument()
    expect(screen.getByText(copy.legal.lastUpdated)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tus derechos' })).toBeInTheDocument()
    const mailLinks = screen.getAllByRole('link', { name: profile.email })
    expect(mailLinks.length).toBeGreaterThan(0)
    expect(mailLinks[0]).toHaveAttribute('href', `mailto:${profile.email}`)
    expect(document.title).toContain(copy.legal.privacy)
  })

  it('renderiza los términos y enlaza a la política de privacidad', () => {
    render(
      <MemoryRouter initialEntries={['/terminos']}>
        <TermsPage />
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: copy.legal.terms })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Precios y presupuestos' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: copy.legal.privacy })[0]).toHaveAttribute(
      'href',
      '/privacidad'
    )
    expect(document.title).toContain(copy.legal.terms)
  })
})
