# Spec — No exponer `detail` del proveedor de email

> **Track ID:** `sec_mail_detail_leak_20261011`
> **Fuente:** Hallazgo **SEC-004 (Baja)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

En `supabase/functions/contact-notify/index.ts` (221-227), cuando Resend falla, la función responde al cliente:

```ts
return json({ error: "mail-send", detail }, ...); // detail recortado a 200 chars
```

El `detail` proviene del cuerpo de error de Resend (config, cuota, dominios no verificados, etc.). Filtrar mensajes internos facilita reconocimiento y no aporta al usuario.

**Objetivo:** responder con un error **genérico** al cliente y registrar el detalle solo server-side.

## 2. Functional Requirements

- **FR1 —** La respuesta al cliente ante fallo de email no incluye `detail` (solo `{ error: "mail-send" }` o similar genérico).
- **FR2 —** El `detail` (y cualquier contexto) se registra con `console.error` en la función.
- **FR3 —** Mantener el status HTTP actual (p. ej. 502/500) y el resto del contrato.

## 3. Non-Functional Requirements

- **NFR1 —** Sin secretos ni PII en logs; el `detail` del proveedor se registra como texto técnico.
- **NFR2 —** Suite verde.

## 4. Acceptance Criteria

- [ ] Respuesta al cliente sin `detail`.
- [ ] `detail` presente en logs server-side.
- [ ] Test unitario de la ruta de error que asegura ausencia de `detail` en la respuesta.

## 5. Out of Scope

- Cambiar de proveedor de email.
- Cambiar validaciones o rate-limit.
