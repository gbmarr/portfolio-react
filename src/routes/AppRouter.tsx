import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from '../App'
import { AuthProvider } from '../lib/auth'
import { LoginPage } from '../pages/LoginPage'
import { RequireAdmin, RequireAuth, RequireClient } from './guards'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { ProjectsListPage } from '../pages/admin/ProjectsListPage'
import { ProjectFormPage } from '../pages/admin/ProjectFormPage'
import { ProjectDetailPage } from '../pages/admin/ProjectDetailPage'
import { ClientsPage } from '../pages/admin/ClientsPage'
import { MessagesPage } from '../pages/admin/MessagesPage'
import { ClientLayout } from '../pages/client/ClientLayout'
import { ClientProjectsPage } from '../pages/client/ClientProjectsPage'
import { ClientProjectDetailPage } from '../pages/client/ClientProjectDetailPage'

/**
 * Router raíz del sitio.
 *
 * - `/` renderiza el portfolio público (SPA de una sola página, con anclas).
 * - `/login` resuelve magic link o contraseña y redirige según el rol.
 * - `/admin/*` es el panel de administración (requiere rol admin).
 * - `/panel/*` es el panel del cliente (requiere sesión).
 * - Cualquier ruta desconocida redirige al home (el sitio público es la
 *   superficie por defecto).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="proyectos" element={<ProjectsListPage />} />
              <Route path="proyectos/nuevo" element={<ProjectFormPage />} />
              <Route path="proyectos/:id" element={<ProjectDetailPage />} />
              <Route path="proyectos/:id/editar" element={<ProjectFormPage />} />
              <Route path="clientes" element={<ClientsPage />} />
              <Route path="mensajes" element={<MessagesPage />} />
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