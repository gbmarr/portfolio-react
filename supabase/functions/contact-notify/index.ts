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
// SEC-005: validación de contenido (pura, testeada con Vitest).
import {
  isTurnstileResponseValid,
  validateContactInput,
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

async function verifyTurnstile(token: string, req: Request): Promise<boolean> {
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
      expectedAction: TURNSTILE_ACTION,
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

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = cors(origin)

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'method' }, 405, headers)
  }

  let raw: Partial<ContactPayload>
  try {
    raw = await req.json()
  } catch {
    return json({ ok: false, error: 'invalid-json' }, 400, headers)
  }

  const check = validateContactInput(raw)
  if (!check.ok) {
    return json({ ok: false, error: 'invalid-payload', reason: check.reason }, 400, headers)
  }

  const turnstileOk = await verifyTurnstile(check.payload.turnstileToken, req)
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
      // El trigger 0010 (throttle_contact_messages) lanza una excepción.
      const msg = String(error.message ?? '')
      if (msg.includes('Demasiados envíos') || msg.toLowerCase().includes('too many')) {
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
      // SEC-004: el detalle del proveedor queda solo en logs server-side.
      logMailError(sent.detail)
      return json(mailSendErrorBody(), 500, headers)
    }

    return json({ ok: true }, 200, headers)
  } catch (err) {
    console.error('contact-notify error', err)
    return json({ ok: false, error: 'internal' }, 500, headers)
  }
})
