export interface TooltipRect {
  top: number
  bottom: number
  left: number
  width: number
}

export interface TooltipPlacementInput {
  wrapperRect: TooltipRect
  tooltipWidth: number
  tooltipHeight: number
  viewportWidth: number
  viewportHeight: number
  margin?: number
}

export interface TooltipPlacement {
  vertical: 'above' | 'below'
  left: number
  arrowLeft: number | null
}

const DEFAULT_MARGIN = 8
// Mitad del ancho de la flecha (h-2 w-2 rotada): si el centro del chip cae
// más cerca del borde que esto, la flecha se ocultaría cortada.
const ARROW_INSET = 6

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calcula cómo posicionar el tooltip de un chip de rubro en función del
 * espacio disponible en el viewport.
 *
 * - Vertical: prefiere `above`; si no entra, `below`; si no entra en ninguno,
 *   elige el lado con más espacio.
 * - Horizontal: centra sobre el chip, pero clampa dentro del viewport para que
 *   no se salga por los bordes laterales.
 * - `left` es relativo al borde izquierdo del wrapper del chip (para usarse
 *   como `style.left` en un contenedor `relative`).
 * - `arrowLeft` es relativo al borde izquierdo del tooltip; `null` si la flecha
 *   quedaría fuera del tooltip (caso defensivo).
 */
export function computeTooltipPlacement({
  wrapperRect,
  tooltipWidth,
  tooltipHeight,
  viewportWidth,
  viewportHeight,
  margin = DEFAULT_MARGIN,
}: TooltipPlacementInput): TooltipPlacement {
  const spaceAbove = wrapperRect.top
  const spaceBelow = viewportHeight - wrapperRect.bottom
  const fitsAbove = spaceAbove >= tooltipHeight + margin
  const fitsBelow = spaceBelow >= tooltipHeight + margin

  let vertical: 'above' | 'below'
  if (fitsAbove) {
    vertical = 'above'
  } else if (fitsBelow) {
    vertical = 'below'
  } else {
    vertical = spaceAbove >= spaceBelow ? 'above' : 'below'
  }

  const centeredLeft = (wrapperRect.width - tooltipWidth) / 2
  const minLeft = margin - wrapperRect.left
  const maxLeft = viewportWidth - margin - tooltipWidth - wrapperRect.left
  const left = clamp(centeredLeft, minLeft, maxLeft)

  const chipCenterX = wrapperRect.left + wrapperRect.width / 2
  const tooltipLeftX = wrapperRect.left + left
  const arrowLeft = chipCenterX - tooltipLeftX
  const arrowFits = arrowLeft >= ARROW_INSET && arrowLeft <= tooltipWidth - ARROW_INSET

  return {
    vertical,
    left,
    arrowLeft: arrowFits ? arrowLeft : null,
  }
}