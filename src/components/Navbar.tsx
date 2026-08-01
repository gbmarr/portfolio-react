import { useState } from 'react'
import { Container } from './Container'
import { profile } from '../data/profile'

const navItems = [
  { name: 'Sobre mí', href: '#sobre-mi' },
  { name: 'Habilidades', href: '#habilidades' },
  { name: 'Proyectos', href: '#proyectos' },
  { name: 'Contacto', href: '#contacto' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Navegación principal">
          <a href="#inicio" className="font-display text-lg font-semibold text-text hover:text-accent">
            {profile.name}
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
              >
                {item.name}
              </a>
            ))}
          </div>

          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:hidden"
          >
            <span className="sr-only">{isOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </Container>

      {isOpen && (
        <div id="mobile-menu" role="menu" className="border-t border-border bg-background/95 md:hidden">
          <Container>
            <ul className="flex flex-col py-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-sm font-medium text-text-muted transition-colors hover:text-accent"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      )}
    </header>
  )
}
