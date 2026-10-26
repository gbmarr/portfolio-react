import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../lib/auth'
import { LoginPage } from '../pages/LoginPage'
import { AdminLoginPage } from '../pages/AdminLoginPage'
import { AdminMfaPage } from '../pages/AdminMfaPage'
import { RequireAdmin, RequireAdminMfa, RequireAuth, RequireClient } from './guards'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { ClientLayout } from '../pages/client/ClientLayout'

// Estas páginas ya viajan en el mismo chunk que el cliente de Supabase: se
// cargan recién cuando el visitante entra a una superficie con sesión, no en
// la landing pública.
const AdminDashboard = lazy(() =>
  import('../pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
)
const ProjectsListPage = lazy(() =>
  import('../pages/admin/ProjectsListPage').then((m) => ({ default: m.ProjectsListPage }))
)
const ProjectFormPage = lazy(() =>
  import('../pages/admin/ProjectFormPage').then((m) => ({ default: m.ProjectFormPage }))
)
const ProjectDetailPage = lazy(() =>
  import('../pages/admin/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage }))
)
const ClientsPage = lazy(() =>
  import('../pages/admin/ClientsPage').then((m) => ({ default: m.ClientsPage }))
)
const MessagesPage = lazy(() =>
  import('../pages/admin/MessagesPage').then((m) => ({ default: m.MessagesPage }))
)
const QuoteRequestsPage = lazy(() =>
  import('../pages/admin/QuoteRequestsPage').then((m) => ({ default: m.QuoteRequestsPage }))
)
const ClientProjectsPage = lazy(() =>
  import('../pages/client/ClientProjectsPage').then((m) => ({ default: m.ClientProjectsPage }))
)
const ClientProjectDetailPage = lazy(() =>
  import('../pages/client/ClientProjectDetailPage').then((m) => ({
    default: m.ClientProjectDetailPage,
  }))
)
const ClientGuidePage = lazy(() =>
  import('../pages/client/ClientGuidePage').then((m) => ({ default: m.ClientGuidePage }))
)

/** Fallback propio para no arrastrar el de AppRouter en cada chunk. */
function PrivateFallback() {
  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center bg-background text-text-muted"
    >
      <span className="sr-only">Cargando…</span>
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
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
  return <Suspense fallback={<PrivateFallback />}>{children}</Suspense>
}

/**
 * Superficies que requieren sesión. Vive en su propio chunk junto con
 * `@supabase/supabase-js`: la landing pública no descarga nada de esto.
 *
 * Las rutas son relativas al splat de AppRouter (`/*`), que es quien las monta.
 */
export default function PrivateRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="acceso-admin" element={<AdminLoginPage />} />

        <Route element={<RequireAdmin />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route
              index
              element={
                <Suspended>
                  <AdminDashboard />
                </Suspended>
              }
            />
            <Route
              path="proyectos"
              element={
                <Suspended>
                  <ProjectsListPage />
                </Suspended>
              }
            />
            <Route
              path="proyectos/nuevo"
              element={
                <Suspended>
                  <ProjectFormPage />
                </Suspended>
              }
            />
            <Route
              path="proyectos/:id"
              element={
                <Suspended>
                  <ProjectDetailPage />
                </Suspended>
              }
            />
            <Route
              path="proyectos/:id/editar"
              element={
                <Suspended>
                  <ProjectFormPage />
                </Suspended>
              }
            />
            <Route
              path="clientes"
              element={
                <Suspended>
                  <ClientsPage />
                </Suspended>
              }
            />
            <Route
              path="mensajes"
              element={
                <Suspended>
                  <MessagesPage />
                </Suspended>
              }
            />
            <Route
              path="presupuestos"
              element={
                <Suspended>
                  <QuoteRequestsPage />
                </Suspended>
              }
            />
          </Route>
        </Route>

        {/* Step-up MFA: solo sesión + rol admin (sin exigir AAL2 todavía). */}
        <Route element={<RequireAdminMfa />}>
          <Route path="admin/mfa" element={<AdminMfaPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<RequireClient />}>
            <Route path="panel" element={<ClientLayout />}>
              <Route
                index
                element={
                  <Suspended>
                    <ClientProjectsPage />
                  </Suspended>
                }
              />
              <Route
                path="guia"
                element={
                  <Suspended>
                    <ClientGuidePage />
                  </Suspended>
                }
              />
              <Route
                path=":id"
                element={
                  <Suspended>
                    <ClientProjectDetailPage />
                  </Suspended>
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
