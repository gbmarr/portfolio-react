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

export type EstimateExtra =
  | { id: string; label: string; kind: 'fixed'; amountUsd: number }
  | { id: string; label: string; kind: 'percent'; percent: number }

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

/** Extras seleccionables (checkboxes) del estimador. */
export const estimateExtras: EstimateExtra[] = [
  { id: 'blog', label: 'Blog / CMS editable', kind: 'fixed', amountUsd: 150 },
  {
    id: 'integraciones',
    label: 'Formularios e integraciones (APIs, Mercado Pago, CRM)',
    kind: 'fixed',
    amountUsd: 120,
  },
  { id: 'multidioma', label: 'Sitio en 2 idiomas', kind: 'percent', percent: 0.4 },
  { id: 'logo', label: 'Diseño de logo / identidad', kind: 'fixed', amountUsd: 200 },
  { id: 'copy', label: 'Redacción de textos', kind: 'fixed', amountUsd: 150 },
  { id: 'ecommerce', label: 'Módulo de tienda online', kind: 'fixed', amountUsd: 600 },
  { id: 'seo', label: 'SEO técnico avanzado + analytics', kind: 'fixed', amountUsd: 100 },
]

export const ecommerceExtraId = 'ecommerce'

/** Texto del plazo cuando se elige la urgencia exprés (prevalece sobre las reglas). */
export const expressTimeline = 'Exprés: hasta 1 semana'

/**
 * Cotización USD→ARS usada solo para la aproximación en pesos del estimador.
 * TODO: ajustar a la cotización vigente antes de cada publicación relevante.
 */
export const arsRate = 1400
