# Spec — Endurecer el rate-limit de contacto

> **Track ID:** `sec_contact_rate_limit_20261011`
> **Fuente:** Hallazgo **SEC-003 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

`throttle_contact_messages` (migraciones `0007` y `0008`) limita envíos por IP leyendo `current_setting('request.headers', true)::json->>'x-forwarded-for'`, tomando el primer valor (`0007:42`, `0008:32`). Dos debilidades:

1. **Fuente no confiable:** el header puede falsificarse o venir ausente. Si `v_ip` es null, la función hace **fail-open** (`0007:48`, `0008:38`).
2. **Passthrough dudoso:** en el flujo real el insert lo hace la Edge Function con `service_role`; no está confirmado que la IP real del cliente llegue a PostgREST como `x-forwarded-for`, por lo que el `429` podría no dispararse nunca (o dispararse con una IP incorrecta).

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

- [ ] Evidencia documentada de qué `x-forwarded-for` ve PostgREST en la vía service_role.
- [ ] Comportamiento ante IP ausente definido y probado.
- [ ] El 429 se dispara de forma verificable ante abuso.
- [ ] `npm run test` / `typecheck` / `lint` verdes.

## 5. Out of Scope

- Cambiar el proveedor de email o el flujo de Turnstile.
- Cerrar el INSERT anónimo (track `sec_contact_anon_insert_20261011`).
