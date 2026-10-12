# Track: Reenvío de invitación en /admin/clientes (UX post-auditoría)

**id**: `invite_ux_fix_20261012`
**tipo**: ux
**origen**: follow-up de la auditoría de seguridad run-2 (análisis read-only del flujo de invitación, 2026-10-12)

## Contexto

En `src/pages/admin/ClientsPage.tsx` el botón de invitación se renderizaba solo cuando `!client.active`:

```tsx
{client.active || invited.has(client.email) ? (
  <span>{invited.has(client.email) ? 'Invitación enviada ✓' : '—'}</span>
) : (
  <button onClick={() => handleInvite(client.email)}>Invitar</button>
)}
```

`active` se define en `src/lib/clients.ts` como "existe una fila en `profiles` para ese email". Como históricamente (y vía `inviteByMagicLink`, `shouldCreateUser: true`) la cuenta se crea **al enviar la invitación**, un cliente invitado pero que **nunca ingresó** ya aparece como "Activo" → el botón queda oculto y el admin no puede reenviarle el enlace mágico desde la lista. El único camino de reenvío está en el detalle del proyecto (`ProjectDetailPage.tsx`), pero no es descubrible desde la lista.

`inviteByMagicLink` (T5 / SEC-005) funciona también para cuentas existentes: `signInWithOtp` a un usuario ya creado envía un OTP/magic link igualmente. No hay cambio de esquema necesario.

## Requerimientos funcionales

- **FR1:** Toda fila de la tabla de clientes muestra una acción en la columna "Acción": `Invitar` (cliente pendiente) o `Reenviar enlace` (cliente activo, cuenta ya creada).
- **FR2:** El click de `Reenviar enlace` llama `inviteByMagicLink(email)` (misma función que el invite; envía OTP a cuentas existentes).
- **FR3:** Tras el click, la fila muestra el estado efímero `Invitación enviada ✓` durante la sesión (comportamiento actual conservado).
- **FR4:** El texto de ayuda de la página aclara que se puede invitar a pendientes o reenviar el enlace a cuentas ya creadas.

## Requerimientos no funcionales

- **NFR1:** Sin cambios de esquema DB ni RLS; cero impacto en auth/MFA.
- **NFR2:** Suite de tests verde (Vitest), typecheck y lint sin errores.
- **NFR3:** Mantener accesibilidad y estados de carga/failure existentes (`sending`, `actionError`).

## Criterios de aceptación

- [x] Un cliente `active: true` muestra `Reenviar enlace` y al hacer click llama `inviteByMagicLink(email)`.
- [x] Un cliente pendiente sigue mostrando `Invitar` (sin regresión).
- [x] El estado `Invitación enviada ✓` sigue apareciendo tras el envío (efímero por sesión).
- [x] `npm run test`, `npm run typecheck` y `npm run lint` pasan.

## Fuera de alcance

- Cambiar la semántica de `active` (requeriría `auth.users.last_sign_in_at`, no accesible vía RLS cliente).
- Persistir "última invitación" en DB.
- Crear issue en GitHub (ajuste menor de UX, se registra como track).