import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../lib/auth'
import { applyRobotsMeta } from '../utils/seo'
import { LoginPage } from '../pages/LoginPage'
import { AdminLoginPage } from '../pages/AdminLoginPage'
import { RequireAdmin, RequireAuth, RequireClient } from './guards'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { ProjectsListPage } from '../pages/admin/ProjectsListPage'
import { ProjectFormPage } from '../pages/admin/ProjectFormPage'
import { ProjectDetailPage } from '../pages/admin/ProjectDetailPage'
import { ClientsPage } from '../pages/admin/ClientsPage'
import { MessagesPage } from '../pages/admin/MessagesPage'
import { AdminSecurityPage } from '../pages/admin/AdminSecurityPage'
import { ClientLayout } from '../pages/client/ClientLayout'
import { ClientProjectsPage } from '../pages/client/ClientProjectsPage'
import { ClientProjectDetailPage } from '../pages/client/ClientProjectDetailPage'

/** Aplica la meta robots según la ruta actual (noindex en superficies privadas). */
function RobotsMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyRobotsMeta(pathname)
  }, [pathname])

  return null
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
              <Route index element={<AdminDashboard />} />
              <Route path="proyectos" element={<ProjectsListPage />} />
              <Route path="proyectos/nuevo" element={<ProjectFormPage />} />
              <Route path="proyectos/:id" element={<ProjectDetailPage />} />
              <Route path="proyectos/:id/editar" element={<ProjectFormPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="mensajes" element={<MessagesPage />} />
              <Route path="seguridad" element={<AdminSecurityPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireClient />}>
              <Route path="/panel" element={<ClientLayout />}>
                <Route index element={<ClientProjectsPage />} />
                <Route path=":id" element={<ClientProjectDetailPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}