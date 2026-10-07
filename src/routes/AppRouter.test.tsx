import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppRouter } from './AppRouter'
import { copy } from '../data/copy'

describe('AppRouter', () => {
  it('renders the public portfolio at /', () => {
    window.history.pushState({}, '', '/')
    render(<AppRouter />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.hero.title)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('redirects unknown routes to the home page', () => {
    window.history.pushState({}, '', '/ruta-que-no-existe')
    render(<AppRouter />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.hero.title)
  })
})
