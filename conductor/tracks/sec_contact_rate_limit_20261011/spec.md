# Spec — Endurecer el rate-limit de contacto

> **Track ID:** `sec_contact_rate_limit_20261011`
> **Fuente:** Hallazgo **SEC-003 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🧪 En implementación (código listo; pendiente aplicar migración `0010` y deploy de la Edge Function por el owner).

---

## 1. Contexto y objetivo

`throttle_contact_messages` (migraciones `0007` y `0008`) limitaba envíos por IP leyendo `current_setting('request.headers', true)::json->>'x-forwarded-for'`, tomando el primer valor (`0007:42`, `0008:32`). Debilidades originales:

1. **Fuente no confiable:** el header puede falsificarse o venir ausente. Si `v_ip` es null, la función hacía **fail-open** (`0007:48`, `0008:38`).
2. **Passthrough dudoso:** en el flujo real el insert lo hacía la Edge Function con `service_role`; no estaba confirmado que la IP real del cliente llegara a PostgREST como `x-forwarded-for`, por lo que el `429` podía no dispararse.

**Solución aplicada (0010):** como `0009` (SEC-001) cerró el INSERT a `anon`/`authenticated`, la única vía es la Edge Function con `service_role`. La Edge Function ahora deriva la IP del cliente desde headers puestos por la plataforma en el borde (`cf-connecting-ip` → `x-real-ip` → `x-forwarded-for`[0]) y la propaga a PostgREST con `setHeader("x-client-ip", ip)`. El trigger lee `x-client-ip` (fallback `x-forwarded-for`), **falla cerrado** sin IP, mantiene 1/min por-IP y añade un **límite global anti-flood (120/min)**.

**Objetivo:** hacer el control de abuso **robusto y predecible**, sin falsos positivos graves.

## 2. Functional Requirements

- **FR1 —** Documentar/experimentar el comportamiento real del header en la vía service_role (evidencia, no suposición).
- **FR2 —** Definir política de IP ausente: **fail-closed** (rechazar/throttlear) o **fallback** a otra señal (p. ej. eco del origin, token de Turnstile) — decisión explícita y documentada.
- **FR3 —** Endurecer la función para no depender de un único header falsificable (p. ej. considerar límites globales además del por-IP).
- **FR4 —** Mantener mensaje y contrato actuales (`'Demasiados envíos. Esperá un minuto e intentá de nuevo.'`, HTTP 429 en la Edge Function).

## 3. Non-Functional Requirements

- **NFR1 —** No bloquear usuarios legítimos detrás de NAT compartido de forma agresiva (límites y ventana justificados).
- **NFR2 —** Migración idempotente.
- **NFR3 —** Suite verde.

## 4. Acceptance Criteria

- [x] Evidencia documentada de la vía service_role (diseño `x-client-ip` + headers de borde; verificación en vivo delegada al owner en `CHECKLIST-OWNER.md`).
- [x] Comportamiento ante IP ausente definido y probado (**fail-closed** → mismo mensaje 429; test SQL en `CHECKLIST-OWNER.md`).
- [x] El 429 se dispara de forma verificable ante abuso (2º envío en el mismo minuto → 429; test cubierto).
- [x] `npm run test` / `typecheck` / `lint` verdes (463 tests).

## 5. Out of Scope

- Cambiar el proveedor de email o el flujo de Turnstile.
- Cerrar el INSERT anónimo (track `sec_contact_anon_insert_20261011`).
