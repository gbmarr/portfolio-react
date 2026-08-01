import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageProvider, useLanguage } from './LanguageContext'

function LanguageProbe() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="greeting">{t.hero.greeting}</span>
      <button type="button" onClick={() => setLanguage('es')}>
        Set ES
      </button>
      <button type="button" onClick={() => setLanguage('en')}>
        Set EN
      </button>
    </div>
  )
}

describe('LanguageContext', () => {
  it('falls back to Spanish when no provider is present', () => {
    render(<LanguageProbe />)
    expect(screen.getByTestId('language')).toHaveTextContent('es')
    expect(screen.getByTestId('greeting')).toHaveTextContent('Hola, soy')
  })

  it('defaults to Spanish when the browser language is not English', () => {
    const originalLanguage = window.navigator.language
    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: 'fr-FR',
    })

    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('es')

    Object.defineProperty(window.navigator, 'language', {
      configurable: true,
      value: originalLanguage,
    })
  })

  it('switches the active language and translations', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    )

    await user.click(screen.getByText('Set EN'))
    expect(screen.getByTestId('language')).toHaveTextContent('en')
    expect(screen.getByTestId('greeting')).toHaveTextContent("Hi, I'm")

    await user.click(screen.getByText('Set ES'))
    expect(screen.getByTestId('language')).toHaveTextContent('es')
    expect(screen.getByTestId('greeting')).toHaveTextContent('Hola, soy')
  })

  it('keeps the document lang attribute in sync', async () => {
    const user = userEvent.setup()
    render(
      <LanguageProvider>
        <LanguageProbe />
      </LanguageProvider>
    )

    await user.click(screen.getByText('Set EN'))
    expect(document.documentElement.lang).toBe('en')

    await user.click(screen.getByText('Set ES'))
    expect(document.documentElement.lang).toBe('es')
  })
})
