import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders a button element with its children', () => {
    render(<Button>Contactar</Button>)
    const button = screen.getByRole('button', { name: 'Contactar' })
    expect(button).toBeInTheDocument()
  })

  it('renders an anchor when href is provided', () => {
    render(<Button href="https://example.com">Visitar demo</Button>)
    const link = screen.getByRole('link', { name: 'Visitar demo' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('applies the primary variant classes by default', () => {
    render(<Button>Acción</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-accent')
  })

  it('applies the secondary variant classes', () => {
    render(<Button variant="secondary">Acción</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
    expect(button).not.toHaveClass('bg-accent')
  })

  it('forwards a custom className', () => {
    render(<Button className="mt-4">Acción</Button>)
    expect(screen.getByRole('button')).toHaveClass('mt-4')
  })
})
