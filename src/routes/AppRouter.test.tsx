import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppRouter, RouteFallback } from './AppRouter'
import { copy } from '../data/copy'
import { panelCopy } from '../data/panel'

const h = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../lib/auth-context', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/auth-context')>()),
  useAuth: h.useAuth,
}))

// Las páginas de gestión cargan datos vía Supabase; en el test del router se
// mockean los repositorios para que los chunks lazy rendericen contenido estable.
vi.mock('../lib/projects', () => ({
  listProjects: vi.fn(async () => []),
  listStagesForProjects: vi.fn(async () => ({})),
  computeProgress: vi.fn(() => ({ done: 0, total: 0 })),
}))
vi.mock('../lib/messages', () => ({ listMessages: vi.fn(async () => []) }))
vi.mock('../lib/briefs', () => ({ listBriefs: vi.fn(async () => []) }))

afterEach(() => {
  document.head.querySelector('meta[name="robots"]')?.remove()
  h.useAuth.mockReset().mockReturnValue({
    session: null,
    profile: null,
    loading: false,
    configured: true,
    aalLevel: null,
    aalResolving: false,
    listMfaFactors: vi.fn(async () => ['factor-1']),
    challengeMfa: vi.fn(async () => 'challenge-1'),
    verifyMfa: vi.fn(),
    enrollMfa: vi.fn(),
    signOut: vi.fn(),
  })
})

describe('RouteFallback', () => {
  it('es un indicador de carga accesible', () => {
    render(<RouteFallback />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByLabelText('Cargando panel')).toBeInTheDocument()
  })
})

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

  it('adds a noindex robots meta on private routes', () => {
    window.history.pushState({}, '', '/login')
    render(<AppRouter />)
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow'
    )
  })

  it('does not add a robots meta on the public home', () => {
    window.history.pushState({}, '', '/')
    render(<AppRouter />)
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('redirige a /acceso-admin si un visitante entra a /admin sin sesión', async () => {
    h.useAuth.mockReturnValue({
      session: null,
      profile: null,
      loading: false,
      configured: true,
    })
    window.history.pushState({}, '', '/admin')
    render(<AppRouter />)

    expect(await screen.findByRole('heading', { name: 'Acceso de gestión' })).toBeInTheDocument()
  })

  it('carga bajo demanda el panel admin para un administrador', async () => {
    h.useAuth.mockReturnValue({
      session: { user: { id: 'u-admin' } },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal2',
      aalResolving: false,
    })
    window.history.pushState({}, '', '/admin')
    render(<AppRouter />)

    // El layout admin es estático y el chunk lazy del dashboard termina cargando.
    expect(await screen.findByRole('link', { name: 'Proyectos' })).toHaveAttribute(
      'href',
      '/admin/proyectos'
    )
    expect(
      await screen.findByRole('heading', { name: panelCopy.nav.dashboard })
    ).toBeInTheDocument()
  })

  it('intercepta a un admin con AAL1 llevándolo a la verificación MFA', async () => {
    h.useAuth.mockReturnValue({
      session: { user: { id: 'u-admin' } },
      profile: { role: 'admin' },
      loading: false,
      aalLevel: 'aal1',
      aalResolving: false,
    })
    window.history.pushState({}, '', '/admin')
    render(<AppRouter />)

    expect(
      await screen.findByRole('heading', { name: panelCopy.adminMfa.title })
    ).toBeInTheDocument()
  })

  it('carga bajo demanda el panel cliente para un cliente', async () => {
    h.useAuth.mockReturnValue({
      session: { user: { id: 'u-client' } },
      profile: { role: 'cliente' },
      loading: false,
    })
    window.history.pushState({}, '', '/panel')
    render(<AppRouter />)

    expect(
      await screen.findByRole('heading', { name: panelCopy.client.projectsTitle })
    ).toBeInTheDocument()
    expect(await screen.findByText(panelCopy.client.emptyProjects)).toBeInTheDocument()
  })
})
