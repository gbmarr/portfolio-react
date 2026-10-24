import { useEffect, useRef, useState } from 'react'
import { Container } from './Container'
import { copy } from '../data/copy'
import { profile } from '../data/profile'

const NAV_ITEMS = [
  { name: copy.nav.home, href: '#inicio' },
  { name: copy.nav.services, href: '#servicios' },
  { name: copy.nav.cases, href: '#trabajos' },
  { name: copy.nav.contact, href: '#contacto' },
]

const SECTION_IDS = NAV_ITEMS.map((item) => item.href.slice(1))

/** Altura del navbar + aire: mismo valor que `scroll-padding-top` en index.css. */
const SCROLL_OFFSET = 96

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState(NAV_ITEMS[0].href)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Elevación al scrollear: sin ella el header parece pegado al contenido.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Sección activa: en una one-page larga el usuario pierde dónde está.
  useEffect(() => {
    let frame = 0

    const compute = () => {
      frame = 0
      let current = SECTION_IDS[0]
      for (const id of SECTION_IDS) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= SCROLL_OFFSET) {
          current = id
        }
      }
      setActiveHash(`#${current}`)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Escape cierra el menú y devuelve el foco al toggle.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-background/80 backdrop-blur transition-[border-color,box-shadow] duration-200 ${
        scrolled ? 'border-border shadow-[0_8px_24px_-16px_rgba(0,0,0,0.9)]' : 'border-transparent'
      }`}
    >
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label={copy.nav.main}>
          <a
            href="#inicio"
            className="font-display text-lg font-semibold text-text transition-colors hover-fine:text-accent"
          >
            {profile.name}
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHash === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`text-sm font-medium transition-colors hover-fine:text-accent ${
                    isActive ? 'text-text' : 'text-text-muted'
                  }`}
                >
                  {item.name}
                </a>
              )
            })}
          </div>

          <button
            ref={toggleRef}
            type="button"
            aria-label={isOpen ? copy.nav.closeMenu : copy.nav.openMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-md p-2 text-text-muted transition-colors hover-fine:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 md:hidden"
          >
            <span className="sr-only">{isOpen ? copy.nav.closeMenu : copy.nav.openMenu}</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>
      </Container>

      {/* Queda montado para poder animar apertura y cierre. Cerrado: inert, así
          los links no son tabulables ni se anuncian. */}
      <div
        id="mobile-menu"
        role="menu"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`grid border-border bg-background/95 transition-[grid-template-rows,opacity] duration-[220ms] ease-out md:hidden ${
          isOpen ? 'grid-rows-[1fr] border-t opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <Container>
            <ul className="flex flex-col py-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    role="menuitem"
                    aria-current={activeHash === item.href ? 'true' : undefined}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 text-sm font-medium text-text-muted transition-colors hover-fine:text-accent"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </div>
    </header>
  )
}
