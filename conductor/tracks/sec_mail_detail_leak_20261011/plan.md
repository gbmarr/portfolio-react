# Plan: No exponer `detail` del proveedor de email

> **Track ID:** `sec_mail_detail_leak_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación (código listo; pendiente deploy Edge Function)

---

## Fase 1 — Cambio

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Quitar `detail` de la respuesta al cliente; loguear con `console.error` | `supabase/functions/contact-notify/index.ts` + `email-result.ts` + `email-result.test.ts` | ☑️ |
| T1.2 | Revisar si `sendResendMail` debe devolver el detail solo al caller interno | mismo archivo | ☑️ (sí: el detalle queda server-side; `logMailError`) |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test de la ruta de error: respuesta sin `detail` | Vitest (`email-result.test.ts`) | ☑️ (2 tests) |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☑️ (70 archivos / 465 tests verdes; typecheck y lint OK) |
| V.3 | Commit `fix(security): no exponer detail del proveedor de email (SEC-004)` + docs | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Perder trazabilidad del error de envío | Mantener el `detail` en logs estructurados server-side |
