import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { IndustryItem } from '../data/types'
import { computeTooltipPlacement } from '../utils/tooltipPosition'
import type { TooltipPlacement } from '../utils/tooltipPosition'

interface IndustryChipProps {
  item: IndustryItem
}

const INITIAL_PLACEMENT: TooltipPlacement = {
  vertical: 'above',
  left: 0,
  arrowLeft: null,
}

/**
 * Chip de rubro con burbuja flotante que muestra el beneficio particular del
 * rubro.
 *
 * Interacción:
 * - Desktop: el hover abre; click fija (pinned) el tooltip.
 * - Táctil: el tap dispara el click, que alterna abrir/cerrar.
 * - Cierra al perder el foco (tap/click afuera), con Escape o al scrollear.
 *
 * Posicionamiento adaptativo: mide el espacio del viewport y rota el tooltip
 * hacia abajo si no entra arriba, o lo corre hacia adentro si el chip está
 * cerca de un borde lateral. La lógica vive en `computeTooltipPlacement`.
 */
export function IndustryChip({ item }: IndustryChipProps) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [placement, setPlacement] = useState<TooltipPlacement>(INITIAL_PLACEMENT)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()

  const updatePlacement = useCallback(() => {
    const wrapper = wrapperRef.current
    const tooltip = tooltipRef.current
    if (!wrapper || !tooltip) return

    const rect = wrapper.getBoundingClientRect()
    setPlacement(
      computeTooltipPlacement({
        wrapperRect: {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
        },
        tooltipWidth: tooltip.offsetWidth,
        tooltipHeight: tooltip.offsetHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }),
    )
  }, [])

  // Medir antes del paint para evitar parpadeos al abrir.
  useLayoutEffect(() => {
    if (open) updatePlacement()
  }, [open, updatePlacement])

  // Cerrar al scrollear y reubicar al redimensionar (rotación del celular).
  useEffect(() => {
    if (!open) return

    const close = () => {
      setOpen(false)
      setPinned(false)
    }
    const handleResize = () => updatePlacement()

    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', handleResize)
    }
  }, [open, updatePlacement])

  const handleClick = () => {
    const nextPinned = !pinned
    setPinned(nextPinned)
    setOpen(nextPinned)
  }

  const closeTooltip = () => {
    setOpen(false)
    setPinned(false)
  }

  return (
    <span
      ref={wrapperRef}
      className="relative inline-block"
      onMouseEnter={() => {
        if (!pinned) setOpen(true)
      }}
      onMouseLeave={() => {
        if (!pinned) setOpen(false)
      }}
    >
      <button
        type="button"
        aria-describedby={open ? tooltipId : undefined}
        onClick={handleClick}
        onBlur={closeTooltip}
        onKeyDown={(event) => {
          if (event.key === 'Escape') closeTooltip()
        }}
        className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-muted transition-colors hover:border-accent/40 hover:text-text focus-visible:border-accent/40 focus-visible:text-text focus-visible:outline-2 focus-visible:outline-accent/60 focus-visible:outline-offset-2"
      >
        {item.name}
      </button>
      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        aria-hidden={!open}
        style={{ left: placement.left }}
        className={`absolute z-20 w-max max-w-[min(280px,calc(100vw-2rem))] rounded-lg border border-border bg-background px-3 py-2 text-xs leading-relaxed text-text-muted shadow-glow transition-opacity duration-150 ${
          placement.vertical === 'above' ? 'bottom-full mb-2' : 'top-full mt-2'
        } ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        {item.benefit}
        <span
          aria-hidden="true"
          style={placement.arrowLeft === null ? undefined : { left: placement.arrowLeft }}
          className={`absolute h-2 w-2 -translate-x-1/2 rotate-45 border-border bg-background ${
            placement.vertical === 'above'
              ? 'top-full -translate-y-1/2 border-b border-r'
              : 'bottom-full translate-y-1/2 border-t border-l'
          } ${placement.arrowLeft === null ? 'hidden' : ''}`}
        />
      </span>
    </span>
  )
}