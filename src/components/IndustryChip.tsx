import { useId, useState } from 'react'
import type { IndustryItem } from '../data/types'

interface IndustryChipProps {
  item: IndustryItem
}

/**
 * Chip de rubro con burbuja flotante que muestra el beneficio particular del
 * rubro. Se abre con hover o foco (en móvil el tap produce foco) y se cierra
 * al salir, al perder el foco o con Escape.
 */
export function IndustryChip({ item }: IndustryChipProps) {
  const [open, setOpen] = useState(false)
  const tooltipId = useId()

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-muted transition-colors hover:border-accent/40 hover:text-text focus-visible:border-accent/40 focus-visible:text-text focus-visible:outline-2 focus-visible:outline-accent/60 focus-visible:outline-offset-2"
      >
        {item.name}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        className={`absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[min(280px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed text-text-muted shadow-glow transition-opacity duration-150 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {item.benefit}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-border bg-background"
        />
      </span>
    </span>
  )
}