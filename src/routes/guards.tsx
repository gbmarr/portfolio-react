import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
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
  const { session, profile, loading, aalLevel, aalResolving } = useAuth()
  const location = useLocation()

  if (loading || aalResolving) return <PanelLoading />
  if (!session) return <Navigate to="/acceso-admin" state={{ from: location.pathname }} replace />
  if (profile?.role !== 'admin') return <Navigate to="/panel" replace />
  // Step-up: una sesión AAL1 (solo contraseña) no entra al panel; primero debe
  // verificarse el segundo factor (SEC-002).
  if (aalLevel !== 'aal2') {
    return <Navigate to="/admin/mfa" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

/**
 * Guard de la pantalla `/admin/mfa`: exige sesión + rol admin PERO no exige
 * AAL2, para permitir el enrolamiento/verificación del segundo factor.
 * Un admin que ya alcanzó AAL2 vuelve directamente al panel.
 */
export function RequireAdminMfa() {
  const { session, profile, loading, aalLevel, aalResolving } = useAuth()
  const location = useLocation()

  if (loading || aalResolving) return <PanelLoading />
  if (!session) return <Navigate to="/acceso-admin" state={{ from: location.pathname }} replace />
  if (profile?.role !== 'admin') return <Navigate to="/panel" replace />
  if (aalLevel === 'aal2') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/admin'} replace />
  }
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
