import { describe, expect, it } from 'vitest'

import vercelRaw from '../vercel.json?raw'
import netlifyRaw from '../netlify.toml?raw'

const CSP = {
  vercel: vercelRaw.match(/"Content-Security-Policy"...value": "([^"]+)"/)?.[1] ?? vercelRaw,
  netlify: netlifyRaw.match(/Content-Security-Policy = "([^"]+)"/)?.[1] ?? netlifyRaw,
} as const

const cspValues = [CSP.vercel, CSP.netlify]

describe('CSP de producción (vercel.json y netlify.toml)', () => {
  it('permite el iframe del challenge de Turnstile (frame-src challenges.cloudflare.com)', () => {
    for (const csp of cspValues) {
      expect(csp).toContain('frame-src https://challenges.cloudflare.com;')
    }
  })

  it('script-src y connect-src incluyen challenges.cloudflare.com', () => {
    for (const csp of cspValues) {
      expect(csp).toContain(
        "script-src 'self' https://va.vercel-scripts.com https://challenges.cloudflare.com;"
      )
      expect(csp).toContain(
        'connect-src ' +
          "'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://challenges.cloudflare.com https://jntueibgkfwptigpncmh.supabase.co https://jntueibgkfwptigpncmh.functions.supabase.co;"
      )
    }
  })

  it('connect-src está acotado al ref exacto de Supabase (SEC-008): sin comodín *.supabase.co ni wss abierto', () => {
    const expected =
      "'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://challenges.cloudflare.com https://jntueibgkfwptigpncmh.supabase.co https://jntueibgkfwptigpncmh.functions.supabase.co;"
    for (const csp of cspValues) {
      expect(csp).toContain('connect-src ' + expected)
      expect(csp).not.toContain('*.supabase.co')
      expect(csp).not.toContain('wss://*.supabase.co')
    }
  })

  it('permite las imágenes firmadas de Supabase Storage en img-src', () => {
    for (const csp of cspValues) {
      expect(csp).toContain("img-src 'self' data: https://jntueibgkfwptigpncmh.supabase.co;")
      expect(csp).not.toContain("img-src 'self' data: https://*.supabase.co")
    }
  })

  it('no permite inline handlers ni unsafe-inline en script-src', () => {
    for (const csp of cspValues) {
      expect(csp).not.toContain('script-src-attr')
      expect(csp).not.toContain("script-src 'self' 'unsafe-inline'")
      expect(csp).not.toContain("'unsafe-eval'")
    }
  })

  it('mantiene frame-ancestors none y object-src none', () => {
    for (const csp of cspValues) {
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("object-src 'none'")
    }
  })

  it('ya no permite api.web3forms.com en connect-src (Web3Forms retirado)', () => {
    for (const csp of cspValues) {
      expect(csp).not.toContain('api.web3forms.com')
    }
  })

  it('sirve las fuentes desde el propio dominio: font-src self y sin Google Fonts', () => {
    for (const csp of cspValues) {
      expect(csp).toContain("font-src 'self';")
      expect(csp).not.toContain('fonts.gstatic.com')
      expect(csp).not.toContain('fonts.googleapis.com')
    }
  })

  it('declara HSTS explícitamente en vercel.json y netlify.toml (SEC-009)', () => {
    expect(vercelRaw).toContain('"Strict-Transport-Security"')
    expect(vercelRaw).toContain('"max-age=63072000"')
    expect(netlifyRaw).toContain('Strict-Transport-Security = "max-age=63072000"')
  })
})

describe('cache de assets en producción', () => {
  it('cachea los assets con hash de forma inmutable', () => {
    expect(vercelRaw).toMatch(
      /"source": "\/assets\/\(\.\*\)"[\s\S]*?"value": "public, max-age=31536000, immutable"/
    )
    expect(netlifyRaw).toMatch(
      /for = "\/assets\/\*"[\s\S]*?Cache-Control = "public, max-age=31536000, immutable"/
    )
  })

  it('cachea fuentes e imágenes sin revalidar en cada visita', () => {
    for (const value of ['public, max-age=604800, stale-while-revalidate=86400']) {
      expect(vercelRaw).toContain(`"value": "${value}"`)
      expect(netlifyRaw).toContain(`Cache-Control = "${value}"`)
    }
    expect(vercelRaw).toContain('"source": "/fonts/(.*)"')
    expect(vercelRaw).toContain('"source": "/images/(.*)"')
    expect(netlifyRaw).toContain('for = "/fonts/*"')
    expect(netlifyRaw).toContain('for = "/images/*"')
  })
})
