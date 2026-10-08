import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { panelCopy } from '../data/panel'

function PanelLoading() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-background text-text-muted"
    >
      <span className="animate-pulse">{panelCopy.loading}</span>
    </div>
  )
}

/** Exige sesión; sin sesión manda a /login recordando desde dónde venía. */
export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PanelLoading />
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}

/** Exige sesión + rol admin; sin sesión va al acceso de gestión oculto. */
export function RequireAdmin() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PanelLoading />
  if (!session) return <Navigate to="/acceso-admin" state={{ from: location.pathname }} replace />
  if (profile?.role !== 'admin') return <Navigate to="/panel" replace />
  return <Outlet />
}

/** Exige sesión + rol cliente; un admin va a /admin. */
export function RequireClient() {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PanelLoading />
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}
