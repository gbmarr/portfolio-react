# Plan: Cerrar INSERT anónimo directo en `contact_messages`

> **Track ID:** `sec_contact_anon_insert_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔄 Código implementado; pendiente aplicar la migración en Supabase (owner).
> **Reglas:** migración idempotente; verificación de no-regresión del flujo legítimo.

---

## Fase 0 — Confirmación

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Confirmar rol efectivo del insert de la Edge Function (`service_role`) y que su insert no depende de RLS | `supabase/functions/contact-notify/index.ts` | ☑️ `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` (189-194); service_role tiene BYPASSRLS |
| T0.2 | Inspeccionar policies actuales de `contact_messages` | `supabase/migrations/0001_init.sql` | ☑️ policy INSERT anon `with check (true)` en 217-220 |

## Fase 1 — Migración

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Crear `0009_contact_insert_lockdown.sql`: `drop policy if exists "cualquiera envía mensaje" on public.contact_messages;` + `revoke insert on public.contact_messages from anon, authenticated;` (solo INSERT; no tocar UPDATE/DELETE del admin) | `supabase/migrations/0009_contact_insert_lockdown.sql` | ☑️ |
| T1.2 | Mantener solo las policies admin de SELECT/UPDATE/DELETE; no re-crear INSERT | misma migración | ☑️ no se tocan |

## Fase 2 — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Retirar `saveContactMessage` (código muerto que ya no funciona sin la policy anon) y su test | `src/lib/messages.ts`, `src/lib/dataLayer.test.ts` | ☑️ función eliminada; test eliminado |
| V.2 | Verificar que el rol anon ya no puede insertar (curl PostgREST con publishable key) | Supabase | ☐ **pendiente**: requiere aplicar `0009` y probar contra el proyecto |
| V.3 | `npm run test` / `typecheck` / `lint` / `coverage` | npm | ☑️ 436 tests verdes; typecheck/lint exit 0; cobertura 92.86% st / 86.77% br |
| V.4 | Commit `fix(security): cerrar INSERT anonimo en contact_messages (SEC-001)` + docs del track | git | ☐ pendiente de confirmación del usuario |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Algún flujo legítimo dependía del insert anónimo | Confirmado en T0.1/V.1: el único insert legítimo es el de la Edge Function (service_role); `saveContactMessage` era código muerto |
| Revocar UPDATE/DELETE rompería el panel admin | NO se revocan: el admin es `authenticated` y usa `markMessageRead`/`deleteMessage` vía RLS |
