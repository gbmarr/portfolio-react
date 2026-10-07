import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { panelCopy } from '../../data/panel'

const navItems = [
  { to: '/admin', label: panelCopy.nav.dashboard, end: true },
  { to: '/admin/proyectos', label: panelCopy.nav.projects },
  { to: '/admin/clientes', label: panelCopy.nav.clients },
  { to: '/admin/mensajes', label: panelCopy.nav.messages },
]

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-muted hover:text-accent'}`

/** Layout del panel de administración: nav + Outlet. */
export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      // Aunque falle el cierre de sesión, volvemos al login.
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-text-muted">
              Gestión
            </span>
            <nav className="flex items-center gap-4" aria-label="Panel admin">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClasses}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-text-muted hover:text-accent">
              {panelCopy.nav.backToSite}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
            >
              {panelCopy.nav.signOut}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
