import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../i18n/LanguageContext'
import { LanguageToggle } from './LanguageToggle'

function renderToggle() {
  return render(
    <LanguageProvider>
      <LanguageToggle />
    </LanguageProvider>
  )
}

describe('LanguageToggle', () => {
  it('renders buttons for both languages', () => {
    renderToggle()
    expect(screen.getByRole('button', { name: 'ES' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
  })

  it('marks the active language as pressed', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'false')

    await user.click(screen.getByRole('button', { name: 'ES' }))
    expect(screen.getByRole('button', { name: 'ES' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false')
  })
})
