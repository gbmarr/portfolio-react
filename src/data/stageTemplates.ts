import type { EstimateTierId } from './estimate'

/**
 * Plantillas de etapas sugeridas por servicio. El admin las usa como punto de
 * partida y ajusta sólo lo que difiera según el proyecto.
 */
const baseStages: Record<EstimateTierId, string[]> = {
  landing: [
    'Relevamiento del brief',
    'Propuesta de diseño',
    'Desarrollo',
    'Revisión del cliente',
    'Ajustes finales',
    'Publicación',
  ],
  institucional: [
    'Relevamiento del brief',
    'Propuesta de diseño',
    'Contenido de secciones',
    'Desarrollo',
    'Revisión del cliente',
    'Ajustes finales',
    'Publicación',
  ],
  medida: [
    'Relevamiento del brief',
    'Definición funcional',
    'Arquitectura y base de datos',
    'Propuesta de diseño',
    'Desarrollo de funcionalidades',
    'Integraciones',
    'Revisión del cliente',
    'Pruebas',
    'Ajustes finales',
    'Publicación',
  ],
}

/** Etapa que aporta cada extra del estimador. */
const extraStageNames: Record<string, string> = {
  blog: 'Configuración del blog/CMS',
  integraciones: 'Conexión de servicios externos',
  multidioma: 'Traducción de contenidos',
  logo: 'Diseño de logo e identidad',
  copy: 'Redacción de textos',
  ecommerce: 'Configuración de la tienda',
  seo: 'SEO técnico y analytics',
}

/**
 * Devuelve las etapas sugeridas para un servicio + extras. Las etapas de extras
 * se insertan justo antes de "Publicación"; las desconocidas o repetidas se ignoran.
 */
export function getStageTemplate(serviceType: EstimateTierId, extraIds: string[]): string[] {
  const stages = [...baseStages[serviceType]]

  const seen = new Set<string>()
  const extraStages: string[] = []
  for (const id of extraIds) {
    if (seen.has(id)) continue
    seen.add(id)
    const name = extraStageNames[id]
    if (name) extraStages.push(name)
  }

  const publishIndex = stages.indexOf('Publicación')
  if (publishIndex === -1) return [...stages, ...extraStages]
  stages.splice(publishIndex, 0, ...extraStages)
  return stages
}
