import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import App from '../App'
import { applyRobotsMeta } from '../utils/seo'

/**
 * Todo lo que necesita sesión (y por lo tanto `@supabase/supabase-js`) vive en
 * un chunk aparte: el visitante anónimo de la landing no lo descarga.
 */
const PrivateRoutes = lazy(() => import('./PrivateRoutes'))

/** Aplica la meta robots según la ruta actual (noindex en superficies privadas). */
function RobotsMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyRobotsMeta(pathname)
  }, [pathname])

  return null
}

/** Fallback accesible mientras se carga el chunk de sesión. */
export function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Cargando panel"
      className="flex min-h-[40vh] items-center justify-center text-text-muted"
    >
      <span className="sr-only">Cargando…</span>
      <span
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
      />
    </div>
  )
}

/**
 * Router raíz del sitio.
 *
 * - `/` renderiza el portfolio público (SPA de una sola página, con anclas).
 * - `/login` es el acceso de clientes (solo enlace mágico).
 * - `/acceso-admin` es el acceso de gestión (path oculto, solo admins).
 * - `/admin/*` es el panel de administración (requiere rol admin).
 * - `/panel/*` es el panel del cliente (requiere sesión).
 * - Cualquier ruta desconocida redirige al home (el sitio público es la
 *   superficie por defecto).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <RobotsMeta />
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <PrivateRoutes />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
