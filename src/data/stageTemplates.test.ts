import { describe, it, expect } from 'vitest'
import { getStageTemplate } from './stageTemplates'
import { estimateExtras } from './estimate'

describe('getStageTemplate', () => {
  it('devuelve la plantilla base de landing con Publicación al final', () => {
    const stages = getStageTemplate('landing', [])
    expect(stages[0]).toBe('Relevamiento del brief')
    expect(stages).toContain('Propuesta de diseño')
    expect(stages).toContain('Desarrollo')
    expect(stages[stages.length - 1]).toBe('Publicación')
    expect(stages).not.toContain('Contenido de secciones')
  })

  it('suma Contenido de secciones en el sitio institucional', () => {
    const stages = getStageTemplate('institucional', [])
    expect(stages).toContain('Contenido de secciones')
    expect(stages[0]).toBe('Relevamiento del brief')
    expect(stages[stages.length - 1]).toBe('Publicación')
  })

  it('usa la plantilla ampliada cuando el servicio es a medida', () => {
    const stages = getStageTemplate('medida', [])
    expect(stages).toContain('Definición funcional')
    expect(stages).toContain('Arquitectura y base de datos')
    expect(stages).toContain('Desarrollo de funcionalidades')
    expect(stages).toContain('Pruebas')
    expect(stages[stages.length - 1]).toBe('Publicación')
  })

  it('inserta las etapas de los extras antes de Publicación', () => {
    const stages = getStageTemplate('landing', ['blog', 'seo'])
    expect(stages).toContain('Configuración del blog/CMS')
    expect(stages).toContain('SEO técnico y analytics')
    expect(stages[stages.length - 1]).toBe('Publicación')
    expect(stages.indexOf('Configuración del blog/CMS')).toBeLessThan(
      stages.indexOf('Publicación'),
    )
  })

  it('ignora extras desconocidos y repetidos', () => {
    const stages = getStageTemplate('landing', ['blog', 'inexistente', 'blog'])
    expect(stages.filter((name) => name === 'Configuración del blog/CMS')).toHaveLength(1)
  })

  it('define una etapa para cada extra del catálogo', () => {
    const base = getStageTemplate('landing', [])
    const withAllExtras = getStageTemplate(
      'landing',
      estimateExtras.map((extra) => extra.id),
    )
    expect(withAllExtras).toHaveLength(base.length + estimateExtras.length)
    expect(withAllExtras[withAllExtras.length - 1]).toBe('Publicación')
  })
})
