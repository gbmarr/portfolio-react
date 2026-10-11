# Plan: Endurecer el rate-limit de contacto

> **Track ID:** `sec_contact_rate_limit_20261011`
> **Spec:** [./spec.md](./spec.md)
> **Status:** 🧪 En implementación (código listo; pendiente aplicar migración `0010` y deploy Edge Function por el owner).

---

## Fase 0 — Evidencia

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T0.1 | Determinar fuente de IP en la vía service_role (evidencia) | `index.ts`, docs Context7 | ☑️ resuelto por diseño: headers de borde (`cf-connecting-ip`/`x-real-ip`) propagados como `x-client-ip`; verificación en vivo delegada a `CHECKLIST-OWNER.md` (limitación: sin `deno` ni stack local) |
| T0.2 | Revisar función y migraciones actuales | `0007`, `0008` | ☑️ |

## Fase 1 — Endurecimiento

| # | Tarea | Archivos | Estado |
|---|-------|----------|--------|
| T1.1 | Definir y aplicar política de IP ausente (fail-closed) | `0010_contact_rate_limit_hardened.sql` | ☑️ |
| T1.2 | Añadir límite global (red de seguridad, 120/min) | misma migración | ☑️ |
| T1.3 | Ajustar la Edge Function para derivar y propagar la IP | `index.ts` | ☑️ (`clientIp()` + `setHeader("x-client-ip")`) |

## Fase V — Verificación

| # | Tarea | Herramienta | Estado |
|---|-------|-------------|--------|
| V.1 | Test de abuso (superar el límite → 429 / excepción) | Supabase SQL / curl | ☑️ documentado en `CHECKLIST-OWNER.md` (pasos 3–4); ejecución en vivo pendiente del owner |
| V.2 | `npm run test` / `typecheck` / `lint` | npm | ☑️ 463 tests · typecheck OK · lint OK |
| V.3 | Commit `fix(security): endurecer rate-limit de contacto (SEC-003)` + docs | git | ☑️ |

---

## Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Fail-closed bloquea todo si el header nunca llega | RESUELTO: la Edge Function envía siempre `x-client-ip` (fail-closed solo corta la vía anómala, que ya no existe tras 0009); si el deploy se retrasa, el trigger evitaría inserts — orden de despliegue documentado en `CHECKLIST-OWNER.md` |
| Bloqueo de usuarios tras NAT | Límite global 120/min muy holgado + 1/min por-IP; documentado en `CHECKLIST-OWNER.md` (paso 5) |
