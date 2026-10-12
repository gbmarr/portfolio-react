import { panelCopy } from '../../data/panel'

/** Estado de carga compartido por las páginas del panel (rol `status`). */
export function Loading() {
  return (
    <p role="status" className="animate-pulse text-text-muted">
      {panelCopy.loading}
    </p>
  )
}
