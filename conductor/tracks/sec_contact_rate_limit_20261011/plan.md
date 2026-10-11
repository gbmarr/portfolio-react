# Plan: Endurecer el rate-limit de contacto

> **Track ID:** `sec_contact_rate_limit_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🔜 Pendiente

---

## Fase 0 — Evidencia

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Probar qué `x-forwarded-for` llega al insert en la vía service_role (log temporal o test controlado) | `supabase/functions/contact-notify/index.ts` | ☐ |
| T0.2 | Revisar función y migraciones actuales | `0007`, `0008` | ☐ |

## Fase 1 — Endurecimiento

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Definir y aplicar política de IP ausente (fail-closed vs. fallback) | nueva migración `0010_*` | ☐ |
| T1.2 | Añadir límite global (además del por-IP) como red de seguridad | misma migración | ☐ |
| T1.3 | Ajustar la Edge Function si hace falta propagar/derivar la IP | `index.ts` | ☐ |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test de abuso (superar el límite → 429 / excepción) | Supabase/Vitest | ☐ |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☐ |
| V.3 | Commit `fix(security): endurecer rate-limit de contacto (SEC-003)` + docs | git | ☐ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Fail-closed bloquea todo si el header nunca llega | Verificar T0.1 antes de decidir; si la IP no llega, preferir límite global + Turnstile como control primario |
| Bloqueo de usuarios tras NAT | Ventana/límites conservadores; documentar |
