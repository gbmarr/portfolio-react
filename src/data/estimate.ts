export type EstimateTierId = 'landing' | 'institucional' | 'medida'

export interface EstimateTier {
  id: EstimateTierId
  name: string
  /** Semanas mínimas y máximas del plazo base. */
  timeline: { minWeeks: number; maxWeeks: number }
}

/** Campos comunes a todo extra del estimador. */
export interface EstimateExtra {
  id: string
  label: string
  /** Tiers donde el extra es seleccionable. */
  tiers: EstimateTierId[]
  /** Tiers donde el extra viene incluido (no seleccionable; se muestra deshabilitado). */
  includedFor?: EstimateTierId[]
}

const allTiers: EstimateTierId[] = ['landing', 'institucional', 'medida']

/** Tiers del estimador (el tier "medida" solo existe acá, no como card pública). */
export const estimateTiers: EstimateTier[] = [
  {
    id: 'landing',
    name: 'Sitio de una página',
    timeline: { minWeeks: 1, maxWeeks: 2 },
  },
  {
    id: 'institucional',
    name: 'Sitio completo',
    timeline: { minWeeks: 2, maxWeeks: 4 },
  },
  {
    id: 'medida',
    name: 'E-commerce o a medida',
    timeline: { minWeeks: 4, maxWeeks: 8 },
  },
]

/**
 * Extras del estimador (checkboxes).
 *
 * `tiers` define dónde el extra es seleccionable; `includedFor` dónde viene
 * incluido en el plan (no seleccionable). Esto evita combinaciones incoherentes
 * (p. ej. una tienda online dentro de una landing de una sola página).
 *
 * Este catálogo NO contiene precios: el presupuesto se arma y se envía por
 * email después de revisar la solicitud.
 */
export const estimateExtras: EstimateExtra[] = [
  {
    id: 'blog',
    label: 'Blog / CMS editable',
    tiers: ['institucional', 'medida'],
  },
  {
    id: 'integraciones',
    label: 'Formularios e integraciones (APIs, Mercado Pago, CRM)',
    tiers: allTiers,
  },
  {
    id: 'multidioma',
    label: 'Sitio en 2 idiomas',
    tiers: allTiers,
  },
  {
    id: 'logo',
    label: 'Diseño de logo / identidad',
    tiers: allTiers,
  },
  {
    id: 'copy',
    label: 'Redacción de textos',
    tiers: allTiers,
  },
  {
    // La tienda solo tiene sentido en el tier de e-commerce/proyecto a medida.
    id: 'ecommerce',
    label: 'Módulo de tienda online',
    tiers: [],
    includedFor: ['medida'],
  },
  {
    id: 'seo',
    label: 'SEO técnico avanzado + analytics',
    tiers: allTiers,
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
