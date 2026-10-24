import { panelCopy } from '../../data/panel'

/**
 * Estado de carga compartido por las páginas del panel (rol `status`).
 * El pulso se desactiva con `prefers-reduced-motion`; el texto sigue
 * comunicando el estado.
 */
export function Loading() {
  return (
    <p role="status" className="flex items-center gap-3 text-text-muted motion-safe:animate-pulse">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent motion-safe:animate-pulse"
      />
      {panelCopy.loading}
    </p>
  )
}
