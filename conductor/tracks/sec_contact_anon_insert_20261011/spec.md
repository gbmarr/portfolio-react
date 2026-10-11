# Spec — Cerrar INSERT anónimo directo en `contact_messages`

> **Track ID:** `sec_contact_anon_insert_20261011`
> **Fuente:** Hallazgo **SEC-001 (Media)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

En `supabase/migrations/0001_init.sql` (líneas 217-220) existe la policy:

```sql
create policy "cualquiera envía mensaje" on public.contact_messages
  for insert to anon, authenticated with check (true);
```

Esto permite que **cualquiera con la publishable key** inserte filas en `contact_messages` directamente contra PostgREST (`POST /rest/v1/contact_messages`), **sin pasar por la Edge Function `contact-notify`** y por lo tanto **sin Turnstile** y sin el resto de la validación. El diseño prevé que el insert lo haga la Edge Function con `service_role` (que bypassa RLS pero dispara triggers). La policy es una superficie de abuso residual (spam/flood/DoS de la tabla y del panel de mensajes).

**Objetivo:** eliminar la vía de insert anónimo, dejando el insert legítimo (Edge Function con service_role) intacto.

## 2. Functional Requirements

- **FR1 —** Eliminar la policy de INSERT anónimo/público en `contact_messages`.
- **FR2 —** Revocar el privilegio de **INSERT** de `anon`/`authenticated` sobre `contact_messages` (defensa en profundidad: aunque no haya policy, RLS ya deniega, pero el revoke deja 0 superficie). **No** se revocan UPDATE/DELETE: el admin (rol `authenticated` con `is_admin()`) los necesita para marcar leído/eliminar.
- **FR3 —** Mantener el flujo de contacto end-to-end: `ContactForm` → Edge Function `contact-notify` → insert con `service_role` → email. El insert del service_role no depende de RLS.
- **FR4 —** Mantener el rate-limit por IP (`throttle_contact_messages`) y las validaciones ya existentes.

## 3. Non-Functional Requirements

- **NFR1 —** Migración idempotente y reversible-documentada (`drop policy if exists`, `revoke`).
- **NFR2 —** Sin cambios en el contrato público de la app ni en la UX del formulario.
- **NFR3 —** Suite de tests verde; cobertura no baja.
- **NFR4 —** Documentar el cambio en el propio archivo de migración y en el spec/plan.

## 4. Acceptance Criteria

- [ ] `POST /rest/v1/contact_messages` con la publishable key (rol `anon`) devuelve error de permisos (401/403), no inserta.
- [ ] El flujo `contact-notify` sigue insertando y enviando email (verificación manual o test de integración).
- [ ] `pg_policies` ya no muestra policy de INSERT para `contact_messages` sobre `anon`/`authenticated`.
- [ ] `npm run test` / `typecheck` / `lint` verdes.

## 5. Out of Scope

- Rediseñar el rate-limit por IP (otro track: `sec_contact_rate_limit_20261011`).
- Mover el envío de email a otro proveedor.
- Cambios en la UI del formulario de contacto.
