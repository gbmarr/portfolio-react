# Informe de seguridad: Red Team — portfolio / gestión de clientes

**Fecha:** 2026-10-12 · **Alcance:** repo `C:\dev\portfolio` (SPA React + Supabase RLS + Edge Functions + CI) · **Método:** paper red team (revisión de código y config, sin pruebas activas) · **Nivel objetivo ASVS:** L2–L3

## Resumen ejecutivo
El sistema arrastra un historial de endurecimiento sólido (SEC-001..012, RLS cuidadoso, CI con SCA/SBOM, PKCE, CSP). Esta revisión adversarial busca las **coronas** (panel admin y PII de clientes) y encuentra un desajuste sistémico: **la MFA del admin se aplica solo en el cliente; la base confía únicamente en `role='admin'`**. Un atacante con la contraseña del admin entra por API sin TOTP y sin dejar rastro. Se recomienda corregir primero el choke point (`is_admin_aal2()`) y luego cerrar el gap de detección (`audit_log`).

| Crítica | Alta | Media | Baja | Info |
|:-:|:-:|:-:|:-:|:-:|
| 0 | 1 | 2 | 1 | 1 |

## Supuestos y límites
- Se asume que `supabase/migrations/0001..0012` es el estado real de la DB.
- La config de Auth (signups, TOTP, SMTP) vive en el dashboard de Supabase y **no** es verificable desde el repo (no hay `supabase/config.toml`).
- **No revisado:** infraestructura de Supabase/Resend/Vercel (terceros), datos reales, pentest activo, ingeniería social.

## Hallazgos

### [RT-01] La MFA del admin no se aplica en el servidor (RLS ignora `aal`) — **Alta**
- **Categoría:** OWASP A07:2021 · CWE-308 · ASVS V2.2/V6.2
- **Ubicación:** `supabase/migrations/0001_init.sql:54-65` (`is_admin()`) + todas las policies de admin; contraste con `src/routes/guards.tsx:27-40` (guard AAL2 client-side).
- **Descripción:** El step-up AAL2 se evalúa en el SPA, pero ninguna política RLS lee `auth.jwt()->>'aal'`. La API autoriza admin por `role='admin'` solamente, así que un token **AAL1** (password grant, sin TOTP) tiene pleno acceso de lectura/escritura.
- **Evidencia / PoC mínima (a ejecutar en staging con autorización):**
  ```http
  POST /auth/v1/token?grant_type=password   → access_token con "aal":"aal1"
  GET  /rest/v1/projects  (Bearer AAL1)     → vulnerable: 200 con filas
  ```
- **Impacto:** exfiltración/edición/borrado de PII de clientes y de `contact_messages` con solo la contraseña del admin; MFA no mitiga su escenario objetivo.
- **Probabilidad / Explotabilidad:** Alta (credencial comprometida es escenario frecuente; bypass trivial).
- **Remediación:**
  ```sql
  create or replace function public.is_admin_aal2()
  returns boolean language sql stable security definer set search_path = public as $$
    select public.is_admin() and coalesce(auth.jwt()->>'aal','') = 'aal2';
  $$;
  -- usar is_admin_aal2() en las policies de admin (choke point único)
  ```
- **Verificación:** token AAL1 → 0 filas/403 en `projects`/`profiles`/`contact_messages`; tras TOTP (AAL2) → funciona.
- **Estado:** Abierto · **Responsable:** owner · **Plazo sugerido:** inmediato (SLA Alta).

### [RT-02] Self-signup abierto por API (GoTrue `shouldCreateUser:true` público) — **Media**
- **Categoría:** OWASP A01/A07 · ASVS V2.1
- **Ubicación:** `src/lib/auth.tsx:121-146` (`signInWithMagicLink` vs `inviteByMagicLink`); endpoint `/auth/v1/otp`.
- **Descripción:** la restricción "no crear cuentas" es solo de UI; el endpoint acepta `create_user=true` para cualquiera con la publishable key. No se verifica `disable_signup`.
- **Impacto:** si un email que figura como `client_email` es controlable, el atacante crea cuenta y accede a ese proyecto (tenancy por email, sin FK).
- **Probabilidad / Explotabilidad:** Media (requiere controlar un email ya cargado o un typo del admin).
- **Remediación:** activar `disable_signup` en Supabase Auth si el modelo es invite-only; normalizar/validar `client_email` al crear proyectos.
- **Verificación:** `otp?create_user=true` con email nuevo → 403 (no crea usuario).
- **Estado:** Abierto · **Responsable:** owner · **Plazo sugerido:** corto plazo.

### [RT-03] `milestone_approvals` UPDATE no re-valida pertenencia del proyecto — **Baja**
- **Categoría:** OWASP A01 · CWE-639 · ASVS V4.1
- **Ubicación:** `0001_init.sql:302-321, 341-345`.
- **Descripción:** el `with check` del UPDATE solo exige `auth.uid()=client_id`; el trigger valida stage↔project pero no project↔cliente.
- **Impacto:** integridad acotada (apuntar una aprobación a un proyecto ajeno con su UUID).
- **Probabilidad / Explotabilidad:** Baja (UUID no enumerable por RLS).
- **Remediación:** añadir el `exists(...)` de ownership del proyecto al `with check` del UPDATE.
- **Verificación:** update con `project_id` ajeno → rechazado.
- **Estado:** Abierto · **Responsable:** owner · **Plazo sugerido:** bajo.

### [RT-04] Sin audit log de acciones admin — **Media (detección)**
- **Categoría:** ASVS V7.1/V7.2
- **Ubicación:** ausente (no hay tabla `audit_log`).
- **Descripción:** las acciones admin no dejan rastro propio; el abuso de RT-01 sería invisible.
- **Impacto:** imposibilidad de detectar/investigar accesos admin anómalos.
- **Remediación:** tabla `audit_log` (actor, acción, entidad, ts, ip) con triggers en tablas sensibles + alertas.
- **Verificación:** la acción de prueba en staging aparece en `audit_log`.
- **Estado:** Abierto · **Responsable:** owner · **Plazo sugerido:** medio.

### [RT-05] Token de sesión en `localStorage` — **Info/Baja**
- **Categoría:** OWASP A07 · CWE-522
- **Ubicación:** `src/lib/supabase.ts` (`storageKey: 'portfolio-auth'`).
- **Descripción:** XSS en el origen → robo de sesión. Mitigado por CSP estricta (sin `unsafe-inline` en scripts).
- **Remediación:** ya analizado en SEC-008/ADR-0001 (cookie httpOnly inviable en SPA estática). Mantener CSP estricta; no introducir `dangerouslySetInnerHTML`.
- **Estado:** Aceptado (riesgo residual) · **Responsable:** owner.

## Controles verificados correctamente
- RLS por email consistente con `is_admin()` security-definer; políticas de INSERT/UPDATE/DELETE acotadas.
- Tenant-resync ante cambio de email (`0006`), INSERT anónimo de contacto revocado (`0009`), rate-limit fail-closed + global (`0010`).
- Validación anti-CRLF server-side y en esquema (`0005`/`0012`); `project_briefs.status` derivado en DB (`0011`).
- PKCE; `envPrefix=['PUBLIC_']`; secretos solo en el dashboard; backups y `.env*` fuera de git (verificado con `git ls-files`).
- CI con lint/typecheck/test/build + `npm audit` + SBOM; CodeQL + Dependabot.

## Recomendaciones de hardening (defensa en profundidad)
- Rate-limit de sign-in y Leaked Password Protection en GoTrue (parcialmente cubierto por SEC-002).
- CSP: evaluar retirar `style-src 'unsafe-inline'` (requiere refactor de estilos inline).
- Monitorizar el `aal` en los logs de PostgREST (alerta de admin sin AAL2).

## Plan de acción priorizado
| # | Acción | Hallazgos | Esfuerzo | Prioridad |
|---|---|---|---|---|
| 1 | `is_admin_aal2()` + policies de admin | RT-01 | S | Inmediata |
| 2 | `audit_log` de acciones admin | RT-04 (habilita RT-01) | M | Alta |
| 3 | `disable_signup` + validación de `client_email` | RT-02 | S | Media |
| 4 | Ownership en `with check` del UPDATE de approvals | RT-03 | S | Baja |

## Riesgo residual y decisiones de aceptación
- **RT-05** (JWT en `localStorage`): aceptado (ADR-0001), responsable owner; revisar si cambia el modelo de deploy (SSR/edge).
- Al aplicar RT-01, agregar procedimiento de recuperación para admins bloqueados en AAL1 (códigos de recuperación).
