# Plan: No exponer `detail` del proveedor de email

> **Track ID:** `sec_mail_detail_leak_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 1 — Cambio

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Quitar `detail` de la respuesta al cliente; loguear con `console.error` | `supabase/functions/contact-notify/index.ts` | ☐ |
| T1.2 | Revisar si `sendResendMail` debe devolver el detail solo al caller interno | mismo archivo | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test de la ruta de error: respuesta sin `detail` | Vitest/Deno test | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `fix(security): no exponer detail del proveedor de email (SEC-004)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Perder trazabilidad del error de envío | Mantener el `detail` en logs estructurados server-side |
