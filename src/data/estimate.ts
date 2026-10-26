export type EstimateTierId = 'landing' | 'institucional' | 'medida'

export interface EstimateTier {
  id: EstimateTierId
  name: string
  baseUsd: number
  /** Semanas mínimas y máximas del plazo base. */
  timeline: { minWeeks: number; maxWeeks: number }
}

type ExtraKind = 'fixed' | 'percent'

/** Campos comunes a todo extra del estimador. */
export interface EstimateExtra {
  id: string
  label: string
  /** Tiers donde el extra es seleccionable. */
  tiers: EstimateTierId[]
  /** Tiers donde el extra viene incluido (no seleccionable; se muestra deshabilitado). */
  includedFor?: EstimateTierId[]
  kind: ExtraKind
  amountUsd?: number
  percent?: number
}

const allTiers: EstimateTierId[] = ['landing', 'institucional', 'medida']

/** Tiers del estimador (uso interno para referencia en panel admin). */
export const estimateTiers: EstimateTier[] = [
  {
    id: 'landing',
    name: 'Sitio de una página',
    baseUsd: 350,
    timeline: { minWeeks: 1, maxWeeks: 2 },
  },
  {
    id: 'institucional',
    name: 'Sitio completo',
    baseUsd: 600,
    timeline: { minWeeks: 2, maxWeeks: 4 },
  },
  {
    id: 'medida',
    name: 'E-commerce o a medida',
    baseUsd: 1200,
    timeline: { minWeeks: 4, maxWeeks: 8 },
  },
]

/**
 * Extras del estimador (uso interno para referencia en panel admin).
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
    percent: 40,
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

/** Extras seleccionables para un tier, en orden de catálogo. */
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

/** ¿El extra es seleccionable para este tier? */
export function isExtraAllowed(tier: EstimateTierId, extraId: string): boolean {
  const extra = estimateExtras.find((item) => item.id === extraId)
  return Boolean(extra?.tiers.includes(tier))
}
