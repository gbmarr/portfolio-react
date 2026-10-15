import {
  resolveArsRate,
  estimateExtras,
  estimateTiers,
  isExtraAllowed,
  type EstimateExtraPercent,
  type EstimateTier,
  type EstimateTierId,
} from '../data/estimate'

export interface EstimateInput {
  tier: EstimateTierId
  /** Solo para el tier institucional; se acota al rango 3–8. */
  sections: number
  /** Ids de extras; los desconocidos se ignoran. */
  extras: string[]
}

export interface EstimateBreakdownRow {
  label: string
  amountUsd: number
}

export interface EstimateResult {
  minUsd: number
  maxUsd: number
  minArs: number
  maxArs: number
  timeline: string
  breakdown: EstimateBreakdownRow[]
}

export const MIN_SECTIONS = 3
export const MAX_SECTIONS = 8
const SECTION_EXTRA_USD = 80
const MAX_RANGE_MULTIPLIER = 1.2

function roundTo10(value: number): number {
  return Math.round(value / 10) * 10
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function findTier(tier: EstimateTierId): EstimateTier {
  return estimateTiers.find((item) => item.id === tier) ?? estimateTiers[0]
}

function buildTimeline(tier: EstimateTier, sections: number, extrasCount: number): string {
  let maxWeeks = tier.timeline.maxWeeks
  // Más de 5 secciones o muchos extras alargan el plazo base.
  if (tier.id === 'institucional' && sections > 5) maxWeeks += 1
  if (extrasCount >= 4) maxWeeks += 1
  return `${tier.timeline.minWeeks} a ${maxWeeks} semanas`
}

/**
 * Rango orientativo de precio (100% client-side, cero fetch).
 * Reglas según spec del track fairuse_20261008 §5.2.
 *
 * @param input  Parámetros de la estimación (tier, secciones, extras).
 * @param arsRate  Cotización USD→ARS. Si no se provee, se resuelve desde
 *   `PUBLIC_ARS_RATE` (fallback 1400) para compatibilidad hacia atrás.
 */
export function computeEstimate(
  input: EstimateInput,
  arsRate = resolveArsRate(import.meta.env.PUBLIC_ARS_RATE)
): EstimateResult {
  const tier = findTier(input.tier)
  const sections =
    tier.id === 'institucional' ? clamp(input.sections, MIN_SECTIONS, MAX_SECTIONS) : 0
  const extraSections = tier.id === 'institucional' ? Math.max(0, sections - MIN_SECTIONS) : 0

  const breakdown: EstimateBreakdownRow[] = []
  breakdown.push({ label: tier.name, amountUsd: tier.baseUsd })
  if (extraSections > 0) {
    breakdown.push({
      label: `Secciones extra (×${extraSections})`,
      amountUsd: extraSections * SECTION_EXTRA_USD,
    })
  }

  let subtotal = tier.baseUsd + extraSections * SECTION_EXTRA_USD
  const percentExtras: EstimateExtraPercent[] = []

  // Solo se aplican extras válidos para el tier (defensa en profundidad: la UI
  // ya filtra, pero el cálculo no debe depender de eso).
  const validExtras = input.extras.filter((id) => isExtraAllowed(tier.id, id))

  for (const id of validExtras) {
    const extra = estimateExtras.find((item) => item.id === id)
    if (!extra) continue
    if (extra.kind === 'fixed') {
      subtotal += extra.amountUsd
      breakdown.push({ label: extra.label, amountUsd: extra.amountUsd })
    } else {
      percentExtras.push(extra)
    }
  }

  // Los extras porcentuales (multidioma) se aplican sobre el subtotal ya sumado.
  for (const extra of percentExtras) {
    const bonus = subtotal * extra.percent
    subtotal += bonus
    breakdown.push({
      label: `${extra.label} (+${Math.round(extra.percent * 100)}%)`,
      amountUsd: bonus,
    })
  }

  const minUsd = roundTo10(subtotal)
  const maxUsd = roundTo10(subtotal * MAX_RANGE_MULTIPLIER)

  return {
    minUsd,
    maxUsd,
    minArs: minUsd * arsRate,
    maxArs: maxUsd * arsRate,
    timeline: buildTimeline(tier, sections, validExtras.length),
    breakdown,
  }
}

/** Mensaje de WhatsApp precargado con el resumen de la estimación. */
export function buildEstimateWhatsAppMessage(input: EstimateInput, result: EstimateResult): string {
  const tier = findTier(input.tier)
  let message = `Hola Gabriel, hice una estimación en tu web para un proyecto tipo "${tier.name}"`
  if (tier.id === 'institucional') {
    const sections = clamp(input.sections, MIN_SECTIONS, MAX_SECTIONS)
    message += ` de ${sections} secciones`
  }
  // Derivar las etiquetas de extras desde el breakdown ya calculado:
  // el breakdown trae [tier base, secciones extra?, extras...]
  const extraLabels = result.breakdown
    .slice(1) // saltar el tier base
    .filter((row) => !row.label.startsWith('Secciones extra'))
    .map((row) => row.label.replace(/ \(.*\)$/, '')) // quitar sufijo "(+X%)" o "(+USD N)"
    .filter((label): label is string => Boolean(label))
  if (extraLabels.length > 0) {
    message += ` con extras: ${extraLabels.join(', ')}`
  }
  message += `. El rango estimado es USD ${result.minUsd} – USD ${result.maxUsd}.`
  message += ' ¿Charlamos para armar el presupuesto cerrado?'
  return message
}
