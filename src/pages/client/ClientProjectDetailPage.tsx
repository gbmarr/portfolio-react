import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loading } from '../../components/ui/Loading'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { useAuth } from '../../lib/auth-context'
import { useAsyncData } from '../../hooks/useAsyncData'
import { loadProjectDetail, ProjectNotFoundError } from '../../lib/projects'
import { panelCopy } from '../../data/panel'
import { ClientProjectDetailView } from './ClientProjectDetailView'

/** Detalle de proyecto para el cliente: timeline + aprobaciones. */
export function ClientProjectDetailPage() {
  const { id } = useParams()
  const { session } = useAuth()

  const load = useCallback(async () => (id ? loadProjectDetail(id) : null), [id])

  const {
    data: detail,
    error,
    loading,
    reload,
  } = useAsyncData(load, [load], {
    mapError: (caught) =>
      caught instanceof ProjectNotFoundError ? panelCopy.client.notFound : panelCopy.error.generic,
  })

  if (loading) {
    return <Loading />
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <ErrorAlert>{error ?? panelCopy.error.generic}</ErrorAlert>
        <Link to="/panel" className="text-sm text-accent hover:underline">
          {panelCopy.client.backLink}
        </Link>
      </div>
    )
  }

  return (
    <ClientProjectDetailView detail={detail} clientId={session?.user.id ?? ''} onReload={reload} />
  )
}
