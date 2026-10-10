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
      expect(csp).toContain("script-src 'self' https://va.vercel-scripts.com https://challenges.cloudflare.com;")
      expect(csp).toContain('connect-src ' + "'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com;")
    }
  })

  it('no permite inline handlers ni unsafe-inline en script-src', () => {
    for (const csp of cspValues) {
      expect(csp).not.toContain("script-src-attr")
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
})