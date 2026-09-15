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

  it('creates Open Graph tags for title, description, type, site_name and image', () => {
    applySeoMeta({
      title: 'Título OG',
      description: 'Descripción OG',
      locale: 'es_ES',
      ogImage: '/images/screenshot.png',
      siteName: 'Mi Sitio',
    })

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'Título OG'
    )
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      'Descripción OG'
    )
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
      'website'
    )
    expect(document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')).toBe(
      'Mi Sitio'
    )
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(
      '/images/screenshot.png'
    )
  })

  it('sets the Open Graph locale', () => {
    applySeoMeta({ title: 'T', description: 'D', locale: 'en_US' })

    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe(
      'en_US'
    )
  })

  it('does not set og:image or og:site_name when not provided', () => {
    applySeoMeta({ title: 'T', description: 'D', locale: 'es_ES' })

    // When ogImage and siteName are omitted, the optional fields are not injected
    expect(document.querySelector('meta[property="og:image"]')).toBeNull()
    expect(document.querySelector('meta[property="og:site_name"]')).toBeNull()
  })
})