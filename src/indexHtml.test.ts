import { describe, expect, it } from 'vitest'
import indexHtml from '../index.html?raw'

// Guardrail: si index.html reintroduce un manejador de eventos inline,
// el CSP vuelve a necesitar `script-src-attr 'unsafe-inline'`.
// Manteniendo el HTML sin handlers inline, el CSP puede ser más estricto.
describe('index.html', () => {
  it('no usa manejadores de eventos inline', () => {
    expect(indexHtml).not.toMatch(
      /\son(?:click|load|error|mouseover|focus|blur|submit|change|input|keydown|keyup|keypress|touchstart|touchend|scroll|wheel|animationend|transitionend)\s*=/i,
    )
  })
})
