import { describe, expect, it } from 'vitest'
import {
  briefTemplates,
  computeBriefStatus,
  getRequiredFields,
  type BriefField,
  type BriefTemplate,
} from './briefTemplates'
import { estimateExtras, type EstimateTierId } from './estimate'

const TIER_IDS: EstimateTierId[] = ['landing', 'institucional', 'medida']

/** Todos los campos visibles para un tier: secciones propias + secciones de todos los extras. */
function allFieldsFor(template: BriefTemplate): BriefField[] {
  const sections = template.sections
  const extraSections = Object.values(template.extraSections).filter(
    (section): section is NonNullable<typeof section> => section != null,
  )
  return [...sections, ...extraSections].flatMap((section) => section.fields)
}

describe('briefTemplates', () => {
  it('cubre exactamente los 3 tiers del estimador', () => {
    expect(Object.keys(briefTemplates).sort()).toEqual([...TIER_IDS].sort())
  })

  it('define una sección para cada extra del estimador, en todos los tiers', () => {
    for (const tier of TIER_IDS) {
      const extraIds = Object.keys(briefTemplates[tier].extraSections)
      expect(extraIds.sort()).toEqual(estimateExtras.map((extra) => extra.id).sort())
    }
  })

  it('mantiene ids de campo únicos dentro de cada tier (incluyendo extras)', () => {
    for (const tier of TIER_IDS) {
      const ids = allFieldsFor(briefTemplates[tier]).map((field) => field.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('solo usa kinds válidos', () => {
    const validKinds = ['text', 'color', 'url', 'longtext', 'yesno']
    for (const tier of TIER_IDS) {
      for (const field of allFieldsFor(briefTemplates[tier])) {
        expect(validKinds).toContain(field.kind)
      }
    }
  })

  it('tiene campos obligatorios en cada tier', () => {
    for (const tier of TIER_IDS) {
      const serviceRequired = briefTemplates[tier].sections.flatMap((section) =>
        section.fields.filter((field) => field.required),
      )
      expect(serviceRequired.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('incluye el campo libre de Drive/Dropbox en todos los tiers', () => {
    for (const tier of TIER_IDS) {
      const ids = allFieldsFor(briefTemplates[tier]).map((field) => field.id)
      expect(ids).toContain('links_externos')
    }
  })
})

describe('getRequiredFields', () => {
  it('devuelve solo los obligatorios de las secciones del servicio + extras seleccionados', () => {
    const template = briefTemplates.landing
    const fields = getRequiredFields(template, [])
    expect(fields.every((field) => field.required)).toBe(true)
    expect(fields.some((field) => field.id === 'nombre')).toBe(true)

    // Al seleccionar el extra integraciones, sus campos requeridos entran.
    const withExtra = getRequiredFields(template, ['integraciones'])
    expect(withExtra.some((field) => field.id === 'sistemas')).toBe(true)
  })
})

describe('computeBriefStatus', () => {
  const template = briefTemplates.landing

  it('está pendiente cuando falta un campo obligatorio', () => {
    const answers: Record<string, string> = { nombre: 'Mi marca' }
    expect(computeBriefStatus(template, [], answers)).toBe('pendiente')
  })

  it('está completado cuando todos los obligatorios están respondidos', () => {
    const answers = requiredAnswersFor(template, [])
    expect(computeBriefStatus(template, [], answers)).toBe('completado')
  })

  it('ignora los campos opcionales vacíos para el estado', () => {
    const answers = { ...requiredAnswersFor(template, []), referencias: '' }
    expect(computeBriefStatus(template, [], answers)).toBe('completado')
  })

  it('exige los obligatorios de las secciones de extras seleccionados', () => {
    const baseAnswers = requiredAnswersFor(template, [])
    expect(computeBriefStatus(template, ['integraciones'], baseAnswers)).toBe('pendiente')

    const withExtraAnswers = {
      ...baseAnswers,
      ...requiredAnswersFor(template, ['integraciones']),
    }
    expect(computeBriefStatus(template, ['integraciones'], withExtraAnswers)).toBe('completado')
  })

  it('no exige secciones de extras no seleccionados', () => {
    const answers = requiredAnswersFor(template, [])
    expect(computeBriefStatus(template, ['seo'], answers)).toBe('completado')
  })
})

/** Arma respuestas válidas para todos los campos obligatorios de un tier (+ extras). */
function requiredAnswersFor(template: BriefTemplate, extraIds: string[]): Record<string, string> {
  return getRequiredFields(template, extraIds).reduce<Record<string, string>>((acc, field) => {
    acc[field.id] = field.kind === 'yesno' ? 'si' : 'Respuesta de prueba'
    return acc
  }, {})
}