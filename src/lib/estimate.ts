import {
  arsRate,
  estimateExtras,
  estimateTiers,
  expressTimeline,
  type EstimateExtra,
  type EstimateTier,
  type EstimateTierId,
} from '../data/estimate'

export interface EstimateInput {
  tier: EstimateTierId
  /** Solo para el tier institucional; se acota al rango 3–8. */
  sections: number
  /** Ids de extras; los desconocidos se ignoran. */
  extras: string[]
  /** Urgencia "menos de una semana" (multiplica el total ×1.3). */
  express: boolean
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

const MIN_SECTIONS = 3
const MAX_SECTIONS = 8
const SECTION_EXTRA_USD = 80
const EXPRESS_MULTIPLIER = 1.3
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

function buildTimeline(
  tier: EstimateTier,
  sections: number,
  extrasCount: number,
  express: boolean,
): string {
  if (express) return expressTimeline
  let maxWeeks = tier.timeline.maxWeeks
  // Más de 5 secciones o muchos extras alargan el plazo base.
  if (tier.id === 'institucional' && sections > 5) maxWeeks += 1
  if (extrasCount >= 4) maxWeeks += 1
  return `${tier.timeline.minWeeks} a ${maxWeeks} semanas`
}

/**
 * Rango orientativo de precio (100% client-side, cero fetch).
 * Reglas según spec del track fairuse_20261008 §5.2.
 */
export function computeEstimate(input: EstimateInput): EstimateResult {
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
  const percentExtras: Array<Extract<EstimateExtra, { kind: 'percent' }>> = []

  for (const id of input.extras) {
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

  const total = input.express ? subtotal * EXPRESS_MULTIPLIER : subtotal
  if (input.express) {
    breakdown.push({ label: 'Urgencia exprés (×1.3)', amountUsd: total - subtotal })
  }

  const minUsd = roundTo10(total)
  const maxUsd = roundTo10(total * MAX_RANGE_MULTIPLIER)

  return {
    minUsd,
    maxUsd,
    minArs: minUsd * arsRate,
    maxArs: maxUsd * arsRate,
    timeline: buildTimeline(tier, sections, input.extras.length, input.express),
    breakdown,
  }
}

/** Mensaje de WhatsApp precargado con el resumen de la estimación. */
export function buildEstimateWhatsAppMessage(input: EstimateInput, result: EstimateResult): string {
  const tier = findTier(input.tier)
  let message = `Hola Gabriel, hice una estimación en tu web para un proyecto tipo "${tier.name}"`
  if (tier.id === 'institucional') {
    message += ` de ${input.sections} secciones`
  }
  const extraLabels = input.extras
    .map((id) => estimateExtras.find((item) => item.id === id)?.label)
    .filter((label): label is string => Boolean(label))
  if (extraLabels.length > 0) {
    message += ` con extras: ${extraLabels.join(', ')}`
  }
  if (input.express) {
    message += ' con urgencia exprés (menos de una semana)'
  }
  message += `. El rango estimado es USD ${result.minUsd} – USD ${result.maxUsd}.`
  message += ' ¿Charlamos para armar el presupuesto cerrado?'
  return message
}
