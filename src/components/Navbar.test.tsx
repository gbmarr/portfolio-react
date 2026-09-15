import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from './Navbar'
import { profile } from '../data/profile'

const navItems = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Trabajos', href: '#trabajos' },
  { name: 'Contacto', href: '#contacto' },
]

describe('Navbar', () => {
  it('renders a navigation landmark with the brand linking to the top', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    const brand = screen.getByRole('link', { name: profile.name })
    expect(nav).toBeInTheDocument()
    expect(brand).toHaveAttribute('href', '#inicio')
  })

  it('renders links to every section', () => {
    render(<Navbar />)
    for (const item of navItems) {
      const link = screen.getByRole('link', { name: item.name })
      expect(link).toHaveAttribute('href', item.href)
    }
  })

  it('starts with the mobile menu closed', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the mobile menu when the toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('closes the mobile menu when the toggle is clicked twice', async () => {
    const user = userEvent.setup()
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    await user.click(toggle)
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})