import { describe, expect, it } from 'vitest'
import {
  briefTemplates,
  computeBriefStatus,
  getRequiredFields,
  hasAnswer,
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
    const validKinds = ['text', 'color', 'url', 'longtext', 'yesno', 'chips', 'select']
    for (const tier of TIER_IDS) {
      for (const field of allFieldsFor(briefTemplates[tier])) {
        expect(validKinds).toContain(field.kind)
      }
    }
  })

  it('declara opciones no vacías en los campos de tipo chips y select', () => {
    for (const tier of TIER_IDS) {
      for (const field of allFieldsFor(briefTemplates[tier])) {
        if (field.kind === 'chips' || field.kind === 'select') {
          expect(Array.isArray(field.options)).toBe(true)
          expect(field.options?.length ?? 0).toBeGreaterThan(0)
        }
      }
    }
  })

  it('usa chips para objetivo, cta_principal e idiomas; select para tipografia', () => {
    const fields = allFieldsFor(briefTemplates.medida)
    const byId = new Map(fields.map((field) => [field.id, field]))
    expect(byId.get('objetivo')?.kind).toBe('chips')
    expect(byId.get('cta_principal')?.kind).toBe('chips')
    expect(byId.get('idiomas')?.kind).toBe('chips')
    expect(byId.get('tipografia')?.kind).toBe('select')
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

describe('hasAnswer', () => {
  it('considera válido un string con contenido', () => {
    expect(hasAnswer('Texto')).toBe(true)
  })

  it('descarta strings vacíos o solo espacios', () => {
    expect(hasAnswer('')).toBe(false)
    expect(hasAnswer('   ')).toBe(false)
  })

  it('considera válido un array con al menos un elemento con contenido', () => {
    expect(hasAnswer(['Español'])).toBe(true)
  })

  it('descarta arrays vacíos o con elementos vacíos', () => {
    expect(hasAnswer([])).toBe(false)
    expect(hasAnswer(['   '])).toBe(false)
  })

  it('descarta undefined', () => {
    expect(hasAnswer(undefined)).toBe(false)
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

  it('considera completado un campo de chips con al menos una opción', () => {
    const answers = { ...requiredAnswersFor(template, []), objetivo: ['Conseguir más clientes'] }
    expect(computeBriefStatus(template, [], answers)).toBe('completado')
  })

  it('está pendiente si un campo de chips obligatorio queda vacío', () => {
    const answers = { ...requiredAnswersFor(template, []), objetivo: [] }
    expect(computeBriefStatus(template, [], answers)).toBe('pendiente')
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