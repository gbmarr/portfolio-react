import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../lib/auth'
import { applyRobotsMeta } from '../utils/seo'
import { LoginPage } from '../pages/LoginPage'
import { AdminLoginPage } from '../pages/AdminLoginPage'
import { RequireAdmin, RequireAuth, RequireClient } from './guards'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { ClientLayout } from '../pages/client/ClientLayout'

// Code-splitting: las páginas de gestión se cargan bajo demanda. El sitio
// público no descarga los chunks de /admin ni /panel hasta que se navega a
// ellos; los layouts y guards siguen estáticos (contexto compartido liviano).
const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
const ProjectsListPage = lazy(() =>
  import('../pages/admin/ProjectsListPage').then((m) => ({ default: m.ProjectsListPage })),
)
const ProjectFormPage = lazy(() =>
  import('../pages/admin/ProjectFormPage').then((m) => ({ default: m.ProjectFormPage })),
)
const ProjectDetailPage = lazy(() =>
  import('../pages/admin/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const ClientsPage = lazy(() =>
  import('../pages/admin/ClientsPage').then((m) => ({ default: m.ClientsPage })),
)
const MessagesPage = lazy(() =>
  import('../pages/admin/MessagesPage').then((m) => ({ default: m.MessagesPage })),
)
const ClientProjectsPage = lazy(() =>
  import('../pages/client/ClientProjectsPage').then((m) => ({ default: m.ClientProjectsPage })),
)
const ClientProjectDetailPage = lazy(() =>
  import('../pages/client/ClientProjectDetailPage').then((m) => ({
    default: m.ClientProjectDetailPage,
  })),
)

/** Aplica la meta robots según la ruta actual (noindex en superficies privadas). */
function RobotsMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyRobotsMeta(pathname)
  }, [pathname])

  return null
}

/** Fallback accesible mientras se carga un chunk lazy (spinner sin fuga de diseño). */
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
        className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
    </div>
  )
}

/**
 * Envuelve una página lazy en su propio `Suspense`. Usar un boundary por ruta
 * mantiene los layouts (AdminLayout/ClientLayout) montados mientras se carga el
 * chunk hijo, evitando pantallas en blanco a nivel pantalla completa.
 */
function Suspended({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
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
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/acceso-admin" element={<AdminLoginPage />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Suspended><AdminDashboard /></Suspended>} />
              <Route path="proyectos" element={<Suspended><ProjectsListPage /></Suspended>} />
              <Route path="proyectos/nuevo" element={<Suspended><ProjectFormPage /></Suspended>} />
              <Route path="proyectos/:id" element={<Suspended><ProjectDetailPage /></Suspended>} />
              <Route path="proyectos/:id/editar" element={<Suspended><ProjectFormPage /></Suspended>} />
              <Route path="clientes" element={<Suspended><ClientsPage /></Suspended>} />
              <Route path="mensajes" element={<Suspended><MessagesPage /></Suspended>} />
            </Route>
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireClient />}>
              <Route path="/panel" element={<ClientLayout />}>
                <Route index element={<Suspended><ClientProjectsPage /></Suspended>} />
                <Route path=":id" element={<Suspended><ClientProjectDetailPage /></Suspended>} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}