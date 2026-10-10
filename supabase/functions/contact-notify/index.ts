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

import { serve } from "https://deno.land/std@0.219.1/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const ALLOWED_ORIGINS = new Set([
  "https://gabrielmarrero.com.ar",
  "https://www.gabrielmarrero.com.ar",
  "http://localhost:5173",
]);

const LIMITS = {
  nameMax: 80,
  emailMax: 120,
  messageMin: 10,
  messageMax: 2000,
};

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

function cors(origin: string | null): Record<string, string> {
  const base = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    return { ...base, "Access-Control-Allow-Origin": origin };
  }
  return base;
}

function json(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function validate(raw: Partial<ContactPayload>):
  | { ok: true; payload: ContactPayload }
  | { ok: false; reason: string } {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  const turnstileToken =
    typeof raw.turnstileToken === "string" ? raw.turnstileToken.trim() : "";

  if (!name || name.length > LIMITS.nameMax) return { ok: false, reason: "name" };
  if (!email || email.length > LIMITS.emailMax) return { ok: false, reason: "email" };
  if (
    !message ||
    message.length < LIMITS.messageMin ||
    message.length > LIMITS.messageMax
  ) {
    return { ok: false, reason: "message" };
  }
  if (!turnstileToken) return { ok: false, reason: "turnstile" };
  return { ok: true, payload: { name, email, message, turnstileToken } };
}

async function verifyTurnstile(token: string, req: Request): Promise<boolean> {
  // Fallback al nombre histórico TURNSTILE_SECRET_KEY para no romper dashboards
  // que ya cargaron el secret con ese nombre (2026-10-10).
  const secret =
    Deno.env.get("TURNSTILE_SECRET") ?? Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) return false;
  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) form.set("remoteip", ip);
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form },
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// Envía por Resend API (Bearer key). Devuelve el detalle del error para que un
// fallo de `mail-send` sea diagnosticable desde el browser.
async function sendResendMail(
  apiKey: string,
  opts: { from: string; to: string; subject: string; text: string; replyTo: string },
): Promise<{ ok: true } | { ok: false; detail: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        reply_to: opts.replyTo,
      }),
    });
    const raw = await res.text();
    if (res.ok) return { ok: true };
    let detail = `http-${res.status}`;
    try {
      const parsed = JSON.parse(raw) as { message?: string };
      if (parsed.message) detail = parsed.message.slice(0, 200);
    } catch {
      detail = raw.slice(0, 120) || `http-${res.status}`;
    }
    return { ok: false, detail };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message.slice(0, 120) : "network",
    };
  }
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "method" }, 405, headers);
  }

  let raw: Partial<ContactPayload>;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, 400, headers);
  }

  const check = validate(raw);
  if (!check.ok) {
    return json({ ok: false, error: "invalid-payload", reason: check.reason }, 400, headers);
  }

  const turnstileOk = await verifyTurnstile(check.payload.turnstileToken, req);
  if (!turnstileOk) {
    return json({ ok: false, error: "turnstile" }, 400, headers);
  }

  try {
    const { name, email, message } = check.payload;
    const mailFrom = Deno.env.get("MAIL_FROM") ?? "hola@gabrielmarrero.com.ar";
    const mailTo = Deno.env.get("MAIL_TO") ?? "hola@gabrielmarrero.com.ar";

    // 1) Copia en contact_messages PRIMERO: el trigger 0007 (rate limit) corta con
    // 429 sin gastar API de email, y un fallo de DB no deja email huérfano.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ ok: false, error: "db-misconfigured" }, 500, headers);
    }
    const supabase = createClient(supabaseUrl, serviceKey);
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, message, subject: null });

    if (error) {
      // El trigger 0007 (throttle_contact_messages) lanza una excepción.
      const msg = String(error.message ?? "");
      if (msg.includes("Demasiados envíos") || msg.toLowerCase().includes("too many")) {
        return json({ ok: false, error: "rate-limited" }, 429, headers);
      }
      return json({ ok: false, error: "db-error" }, 500, headers);
    }

    // 2) Envío por Resend API (Bearer key).
    const apiKey = Deno.env.get("MAIL_PROVIDER_API_KEY");
    if (!apiKey) {
      return json({ ok: false, error: "mail-misconfigured" }, 500, headers);
    }

    const sent = await sendResendMail(apiKey, {
      from: mailFrom,
      to: mailTo,
      subject: `Nuevo mensaje de ${name} <${email}>`,
      text: message,
      replyTo: email,
    });
    if (!sent.ok) {
      return json(
        { ok: false, error: "mail-send", detail: sent.detail },
        500,
        headers,
      );
    }

    return json({ ok: true }, 200, headers);
  } catch (err) {
    console.error("contact-notify error", err);
    return json({ ok: false, error: "internal" }, 500, headers);
  }
});