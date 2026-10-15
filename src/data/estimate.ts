import { services } from './services'

export type EstimateTierId = 'landing' | 'institucional' | 'medida'

export interface EstimateTier {
  id: EstimateTierId
  name: string
  /** Precio base en USD. */
  baseUsd: number
  /** Semanas mínimas y máximas del plazo base. */
  timeline: { minWeeks: number; maxWeeks: number }
}

/** Campos comunes a todo extra del estimador. */
export interface EstimateExtraBase {
  id: string
  label: string
  /** Tiers donde el extra es seleccionable y cobrable. */
  tiers: EstimateTierId[]
  /** Tiers donde el extra viene incluido (no seleccionable; se muestra deshabilitado). */
  includedFor?: EstimateTierId[]
}

export type EstimateExtraFixed = EstimateExtraBase & { kind: 'fixed'; amountUsd: number }
export type EstimateExtraPercent = EstimateExtraBase & { kind: 'percent'; percent: number }

export type EstimateExtra = EstimateExtraFixed | EstimateExtraPercent

const allTiers: EstimateTierId[] = ['landing', 'institucional', 'medida']

const landingService = services.find((service) => service.id === 'landing')
const institucionalService = services.find((service) => service.id === 'institucional')

/** Tiers del estimador (el tier "medida" solo existe acá, no como card pública). */
export const estimateTiers: EstimateTier[] = [
  {
    id: 'landing',
    name: 'Landing page',
    // Misma fuente que el precio "desde" público en ServiceCard.
    baseUsd: landingService?.priceFromUsd ?? 250,
    timeline: { minWeeks: 1, maxWeeks: 2 },
  },
  {
    id: 'institucional',
    name: 'Sitio institucional',
    baseUsd: institucionalService?.priceFromUsd ?? 450,
    timeline: { minWeeks: 2, maxWeeks: 4 },
  },
  {
    id: 'medida',
    name: 'E-commerce o proyecto a medida',
    baseUsd: 1200,
    timeline: { minWeeks: 4, maxWeeks: 8 },
  },
]

/**
 * Extras del estimador (checkboxes).
 *
 * `tiers` define dónde el extra es seleccionable; `includedFor` dónde viene
 * incluido en el plan (no seleccionable). Esto evita combinaciones incoherentes
 * (p. ej. una tienda online dentro de una landing de una sola página) y el
 * arbitraje de precio entre "institucional + tienda" y el tier `medida`.
 */
export const estimateExtras: EstimateExtra[] = [
  {
    id: 'blog',
    label: 'Blog / CMS editable',
    tiers: ['institucional', 'medida'],
    kind: 'fixed',
    amountUsd: 150,
  },
  {
    id: 'integraciones',
    label: 'Formularios e integraciones (APIs, Mercado Pago, CRM)',
    tiers: allTiers,
    kind: 'fixed',
    amountUsd: 120,
  },
  {
    id: 'multidioma',
    label: 'Sitio en 2 idiomas',
    tiers: allTiers,
    kind: 'percent',
    percent: 0.4,
  },
  {
    id: 'logo',
    label: 'Diseño de logo / identidad',
    tiers: allTiers,
    kind: 'fixed',
    amountUsd: 200,
  },
  {
    id: 'copy',
    label: 'Redacción de textos',
    tiers: allTiers,
    kind: 'fixed',
    amountUsd: 150,
  },
  {
    // La tienda solo tiene sentido en el tier de e-commerce/proyecto a medida.
    id: 'ecommerce',
    label: 'Módulo de tienda online',
    tiers: [],
    includedFor: ['medida'],
    kind: 'fixed',
    amountUsd: 600,
  },
  {
    id: 'seo',
    label: 'SEO técnico avanzado + analytics',
    tiers: allTiers,
    kind: 'fixed',
    amountUsd: 100,
  },
]

export const ecommerceExtraId = 'ecommerce'

/** Extras seleccionables (cobrables) para un tier, en orden de catálogo. */
export function getSelectableExtras(tier: EstimateTierId): EstimateExtra[] {
  return estimateExtras.filter((extra) => extra.tiers.includes(tier))
}

/** Extras incluidos en el plan de un tier (no seleccionables), en orden de catálogo. */
export function getIncludedExtras(tier: EstimateTierId): EstimateExtra[] {
  return estimateExtras.filter((extra) => extra.includedFor?.includes(tier))
}

/** Extras visibles para un tier: seleccionables + incluidos, en orden de catálogo. */
export function getVisibleExtras(tier: EstimateTierId): EstimateExtra[] {
  return estimateExtras.filter(
    (extra) => extra.tiers.includes(tier) || extra.includedFor?.includes(tier)
  )
}

/** ¿El extra es seleccionable (cobrable) para este tier? */
export function isExtraAllowed(tier: EstimateTierId, extraId: string): boolean {
  const extra = estimateExtras.find((item) => item.id === extraId)
  return Boolean(extra?.tiers.includes(tier))
}

/** Cotización USD→ARS por defecto usada cuando `PUBLIC_ARS_RATE` no está definida o es inválida. */
export const DEFAULT_ARS_RATE = 1400

/**
 * Resuelve la cotización USD→ARS a partir de la env pública `PUBLIC_ARS_RATE`.
 *
 * La env llega del bundle de Vite como string (o undefined si no está
 * definida). Solo un número positivo es aceptado; cualquier otro valor
 * (vacío, no numérico, cero, negativo, NaN) cae al fallback.
 */
export function resolveArsRate(raw?: string): number {
  const value = Number(raw?.trim())
  return value > 0 ? value : DEFAULT_ARS_RATE
}
