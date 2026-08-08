import { describe, expect, it, afterEach } from 'vitest'
import { applySeoMeta } from './seo'

afterEach(() => {
  document.head.innerHTML = ''
})

describe('applySeoMeta', () => {
  it('sets the document title', () => {
    applySeoMeta({ title: 'Portfolio Test', description: 'Descripción', locale: 'es_ES' })
    expect(document.title).toBe('Portfolio Test')
  })

  it('creates the description meta tag when missing', () => {
    applySeoMeta({ title: 'T', description: 'Mi descripción', locale: 'es_ES' })
    const meta = document.querySelector('meta[name="description"]')
    expect(meta).not.toBeNull()
    expect(meta?.getAttribute('content')).toBe('Mi descripción')
  })

  it('updates an existing description meta tag without duplicating it', () => {
    applySeoMeta({ title: 'T1', description: 'Primera', locale: 'es_ES' })
    applySeoMeta({ title: 'T2', description: 'Segunda', locale: 'es_ES' })

    const metas = document.querySelectorAll('meta[name="description"]')
    expect(metas).toHaveLength(1)
    expect(metas[0].getAttribute('content')).toBe('Segunda')
  })

  it('creates Open Graph tags for title and description', () => {
    applySeoMeta({ title: 'Título OG', description: 'Descripción OG', locale: 'es_ES' })

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Título OG'
    )
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      'Descripción OG'
    )
  })

  it('sets the Open Graph locale', () => {
    applySeoMeta({ title: 'T', description: 'D', locale: 'en_US' })

    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_US'
    )
  })
})
