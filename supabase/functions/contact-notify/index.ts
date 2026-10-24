// contact-notify — única Edge Function permitida por fair-use (ver `conductor/fair-use.md`).
//
// Flujo: turnstile siteverify -> validación del payload -> copia en
// contact_messages PRIMERO (pasa el trigger 0007 de rate limit => 429 si
// excede, sin gastar API de email) -> envío por Resend API (Bearer token).
//
// Security notes:
// - require JWT deshabilitado para este endpoint (la llama el browser sin auth).
//   Local:   supabase functions serve contact-notify --no-verify-jwt --env-file .env.local
//   Deploy:  supabase functions deploy contact-notify --no-verify-jwt
// - Secretos (SOLO dashboard / `supabase secrets set`; nunca en el repo):
//   TURNSTILE_SECRET (o su alias histórico TURNSTILE_SECRET_KEY),
//   MAIL_PROVIDER_API_KEY (API key de Resend), y opcionales:
//   MAIL_FROM (default hola@gabrielmarrero.com.ar), MAIL_TO (default igual),
//   MAIL_FROM_NAME.
// - SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan automáticamente en deploy
//   (en local con `--env-file .env.local` hay que definirlas).
// - Resend: el dominio gabrielmarrero.com.ar debe estar verificado con los
//   records DKIM + SPF que da el dashboard de Resend. Zoho Mail puede seguir
//   como receptor (el SPF admite varios `include`). Ver CHECKLIST-OWNER.md.
// - Pivote 2026-10-10: se reemplazó el envío por Zoho Mail API (OAuth2) —
//   los secrets ZOHO_* quedaron inertes y pueden borrarse del dashboard.

import { serve } from 'https://deno.land/std@0.219.1/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.117.3'
// SEC-004: helpers de error del envío (puros, testeados con Vitest).
import { logMailError, mailSendErrorBody } from './email-result.ts'
// Contrato compartido con el cliente (límites, patrón de email, acción Turnstile).
import { isSafeEmail, TURNSTILE_ACTION } from '../../../src/shared/contact-contract.ts'
import {
  TURNSTILE_ACTION_QUOTE,
  type QuotePayload,
} from '../../../src/shared/quote-contract.ts'
// SEC-005: validación de contenido (pura, testeada con Vitest).
import {
  isTurnstileResponseValid,
  validateContactInput,
  validateQuoteInput,
  type ContactPayload,
  type TurnstileVerifyResponse,
} from './validation.ts'

const ALLOWED_ORIGINS = new Set([
  'https://gabrielmarrero.com.ar',
  'https://www.gabrielmarrero.com.ar',
  'http://localhost:5173',
])

// SEC-006: hostnames desde los que Turnstile puede emitir un token válido.
// Deben reflejar los hostnames configurados en el sitio de Cloudflare Turnstile
// (`gabrielmarrero.com.ar`, `www.…` y `localhost` para dev).
const TURNSTILE_ALLOWED_HOSTNAMES = [
  'gabrielmarrero.com.ar',
  'www.gabrielmarrero.com.ar',
  'localhost',
]

function cors(origin: string | null): Record<string, string> {
  const base = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return { ...base, 'Access-Control-Allow-Origin': origin }
  }
  return base
}

// SEC-003: IP real del cliente. `cf-connecting-ip` / `x-real-ip` los pone la
// plataforma en el borde (Cloudflare/Supabase) y NO son falsificables por el
// browser (se reescriben/limpian en el gateway); `x-forwarded-for` queda como
// fallback documentado, tomando el primer valor de la cadena.
function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    ''
  )
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

async function verifyTurnstile(
  token: string,
  req: Request,
  expectedAction: string
): Promise<boolean> {
  // Fallback al nombre histórico TURNSTILE_SECRET_KEY para no romper dashboards
  // que ya cargaron el secret con ese nombre (2026-10-10).
  const secret = Deno.env.get('TURNSTILE_SECRET') ?? Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) return false
  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', token)
  const ip = clientIp(req)
  if (ip) form.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    })
    // SEC-006: no alcanza con `success`; se valida además la acción y el hostname.
    const data = (await res.json()) as TurnstileVerifyResponse
    return isTurnstileResponseValid(data, {
      allowedHostnames: TURNSTILE_ALLOWED_HOSTNAMES,
      expectedAction,
    })
  } catch {
    return false
  }
}

// Envía por Resend API (Bearer key). Devuelve el detalle del error al caller
// interno para logging server-side (SEC-004): NO se expone al browser.
async function sendResendMail(
  apiKey: string,
  opts: { from: string; to: string; subject: string; text: string; replyTo?: string }
): Promise<{ ok: true } | { ok: false; detail: string }> {
  try {
    const body: Record<string, unknown> = {
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    }
    // SEC-005: `reply_to` solo cuando el valor es un email válido; si el emisor
    // dejó un WhatsApp/teléfono, se omite (nunca llega crudo a un header).
    if (opts.replyTo) body.reply_to = opts.replyTo
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const raw = await res.text()
    if (res.ok) return { ok: true }
    let detail = `http-${res.status}`
    try {
      const parsed = JSON.parse(raw) as { message?: string }
      if (parsed.message) detail = parsed.message.slice(0, 200)
    } catch {
      detail = raw.slice(0, 120) || `http-${res.status}`
    }
    return { ok: false, detail }
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message.slice(0, 120) : 'network',
    }
  }
}

type RequestBody = Record<string, unknown>

const QUOTE_TIER_LABELS: Record<string, string> = {
  landing: 'Sitio de una página',
  institucional: 'Sitio institucional',
  medida: 'Proyecto a medida',
}

const QUOTE_EXTRA_LABELS: Record<string, string> = {
  blog: 'Blog',
  integraciones: 'Integraciones',
  multidioma: 'Multidioma',
  logo: 'Diseño de logo',
  copy: 'Redacción de copy',
  ecommerce: 'E-commerce',
  seo: 'SEO',
}

function isRateLimitError(message: string): boolean {
  return (
    message.includes('Demasiados') ||
    message.includes('Demasiadas') ||
    message.toLowerCase().includes('too many')
  )
}

async function handleContact(
  raw: RequestBody,
  req: Request,
  headers: Record<string, string>
): Promise<Response> {
  const check = validateContactInput(raw as unknown as Partial<ContactPayload>)
  if (!check.ok) {
    return json({ ok: false, error: 'invalid-payload', reason: check.reason }, 400, headers)
  }

  const turnstileOk = await verifyTurnstile(check.payload.turnstileToken, req, TURNSTILE_ACTION)
  if (!turnstileOk) {
    return json({ ok: false, error: 'turnstile' }, 400, headers)
  }

  try {
    const { name, email, message } = check.payload
    const mailFrom = Deno.env.get('MAIL_FROM') ?? 'hola@gabrielmarrero.com.ar'
    const mailTo = Deno.env.get('MAIL_TO') ?? 'hola@gabrielmarrero.com.ar'

    // 1) Copia en contact_messages PRIMERO: el trigger 0010 (rate limit endurecido
    // SEC-003) corta con 429 sin gastar API de email, y un fallo de DB no deja
    // email huérfano.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      return json({ ok: false, error: 'db-misconfigured' }, 500, headers)
    }
    const supabase = createClient(supabaseUrl, serviceKey)
    // SEC-003: propagar la IP real del cliente a PostgREST en un header propio
    // (`x-client-ip`). El trigger throttle_contact_messages (0010) lo lee desde
    // `current_setting('request.headers')` y falla cerrado si no llega.
    const ip = clientIp(req)
    const query = supabase.from('contact_messages').insert({ name, email, message, subject: null })
    const { error } = ip ? await query.setHeader('x-client-ip', ip.slice(0, 64)) : await query

    if (error) {
      if (isRateLimitError(String(error.message ?? ''))) {
        return json({ ok: false, error: 'rate-limited' }, 429, headers)
      }
      return json({ ok: false, error: 'db-error' }, 500, headers)
    }

    // 2) Envío por Resend API (Bearer key).
    const apiKey = Deno.env.get('MAIL_PROVIDER_API_KEY')
    if (!apiKey) {
      return json({ ok: false, error: 'mail-misconfigured' }, 500, headers)
    }

    const sent = await sendResendMail(apiKey, {
      from: mailFrom,
      to: mailTo,
      subject: `Nuevo mensaje de ${name} <${email}>`,
      text: message,
      replyTo: isSafeEmail(email) ? email : undefined,
    })
    if (!sent.ok) {
      logMailError(sent.detail)
      return json(mailSendErrorBody(), 500, headers)
    }

    return json({ ok: true }, 200, headers)
  } catch (err) {
    console.error('contact-notify contact error', err)
    return json({ ok: false, error: 'internal' }, 500, headers)
  }
}

async function handleQuote(
  raw: RequestBody,
  req: Request,
  headers: Record<string, string>
): Promise<Response> {
  const check = validateQuoteInput(raw as unknown as Partial<QuotePayload>)
  if (!check.ok) {
    return json({ ok: false, error: 'invalid-payload', reason: check.reason }, 400, headers)
  }

  const turnstileOk = await verifyTurnstile(
    check.payload.turnstileToken,
    req,
    TURNSTILE_ACTION_QUOTE
  )
  if (!turnstileOk) {
    return json({ ok: false, error: 'turnstile' }, 400, headers)
  }

  try {
    const { name, email, tier, sections, extras, notes, consentVersion } = check.payload
    const consentAt = new Date().toISOString()
    const mailFrom = Deno.env.get('MAIL_FROM') ?? 'hola@gabrielmarrero.com.ar'
    const mailTo = Deno.env.get('MAIL_TO') ?? 'hola@gabrielmarrero.com.ar'

    // 1) Guardar la solicitud PRIMERO. El trigger 0018 aplica rate limit
    // fail-closed (IP/email/global) antes de gastar la API de email.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) {
      return json({ ok: false, error: 'db-misconfigured' }, 500, headers)
    }
    const supabase = createClient(supabaseUrl, serviceKey)
    const ip = clientIp(req)
    const query = supabase.from('quote_requests').insert({
      name,
      email,
      tier,
      sections,
      extras,
      notes: notes || null,
      consent_at: consentAt,
      consent_version: consentVersion,
      status: 'new',
    })
    const { error } = ip ? await query.setHeader('x-client-ip', ip.slice(0, 64)) : await query

    if (error) {
      if (isRateLimitError(String(error.message ?? ''))) {
        return json({ ok: false, error: 'rate-limited' }, 429, headers)
      }
      return json({ ok: false, error: 'db-error' }, 500, headers)
    }

    // 2) Avisar SOLO al owner. El solicitante recibe el presupuesto cuando el
    // owner responde manualmente; no hay email automático al usuario.
    const apiKey = Deno.env.get('MAIL_PROVIDER_API_KEY')
    if (!apiKey) {
      return json({ ok: false, error: 'mail-misconfigured' }, 500, headers)
    }

    const tierLabel = QUOTE_TIER_LABELS[tier] ?? tier
    const extraLabels = extras.map((id) => QUOTE_EXTRA_LABELS[id] ?? id)
    const text = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Tipo: ${tierLabel}`,
      `Secciones: ${sections > 0 ? sections : 'No aplica'}`,
      `Extras: ${extraLabels.length ? extraLabels.join(', ') : 'Ninguno'}`,
      '',
      'Notas:',
      notes || 'Sin notas.',
      '',
      `Consentimiento: aceptado (versión ${consentVersion}) el ${consentAt}.`,
      '',
      'Respondé este email para enviarle el presupuesto al solicitante.',
    ].join('\n')

    const sent = await sendResendMail(apiKey, {
      from: mailFrom,
      to: mailTo,
      subject: `Solicitud de presupuesto — ${tierLabel} — ${name}`,
      text,
      replyTo: isSafeEmail(email) ? email : undefined,
    })
    if (!sent.ok) {
      logMailError(sent.detail)
      return json(mailSendErrorBody(), 500, headers)
    }

    return json({ ok: true }, 200, headers)
  } catch (err) {
    console.error('contact-notify quote error', err)
    return json({ ok: false, error: 'internal' }, 500, headers)
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = cors(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'method' }, 405, headers)
  }

  let parsed: unknown
  try {
    parsed = await req.json()
  } catch {
    return json({ ok: false, error: 'invalid-json' }, 400, headers)
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return json({ ok: false, error: 'invalid-payload', reason: 'kind' }, 400, headers)
  }

  const raw = parsed as RequestBody
  if (raw.kind !== undefined && raw.kind !== 'contact' && raw.kind !== 'quote') {
    return json({ ok: false, error: 'invalid-payload', reason: 'kind' }, 400, headers)
  }

  return raw.kind === 'quote'
    ? await handleQuote(raw, req, headers)
    : await handleContact(raw, req, headers)
})
