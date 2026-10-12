# CHECKLIST-OWNER — RT-01 (admin requiere AAL2 en RLS)

> Track: `sec_admin_mfa_rls_20261012` · Issue: #25 · Migración: `0013_admin_aal2.sql`

Perfil: **owner** (acceso al dashboard de Supabase). Este paso hace efectivo el control en la base; el código ya lo exige en la UI.

---

## 1. Aplicar la migración 0013 (obligatorio)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0013_admin_aal2.sql`.
3. Ejecutá. Debería terminar sin errores: crea `is_admin_aal2()`, redefine `is_admin()` para delegar en él y añade `is_admin_role()` (rol sin AAL2, solo informativo).

**Qué hace:** a partir de ahora, **toda** policy/trigger que autoriza como admin exige, además de `role='admin'`, que la sesión sea **AAL2** (`auth.jwt()->>'aal' = 'aal2'`). Un token AAL1 (password sin TOTP) deja de acceder a los datos de admin (~20 policies endurecidas con un solo cambio).

> ⚠️ **Deploy acoplado:** aplicá la migración **junto** con el deploy del código del track. Si el código ya exige AAL2 en la UI (SEC-002), la migración es la que lo hace efectivo en la base. Aplicar la migración primero no rompe nada (el flujo de step-up ya existe).

## 2. Verificación manual (recomendada en un proyecto de prueba)

1. Entrá como admin **sin** verificar TOTP (AAL1) e intentá leer datos de admin por API con el bearer de esa sesión:
   ```http
   GET https://<ref>.supabase.co/rest/v1/projects?select=client_email
   Authorization: Bearer <token AAL1>
   apikey: <publishable>
   ```
   → Debe devolver **0 filas** (o 403), no los proyectos.
2. Verificá TOTP (AAL2) y repetí el request.
   → Debe devolver las filas normalmente.
3. Confirmá que en AAL1 seguís pudiendo leer **tu propio** perfil (rol) — el step-up lo necesita:
   ```http
   GET https://<ref>.supabase.co/rest/v1/profiles?select=role&id=eq.<tu-uid>
   Authorization: Bearer <token AAL1>
   ```
   → Debe devolver tu fila.

## 3. Recuperación (admin bloqueado en AAL1)

Si perdés el dispositivo TOTP, quedás fuera del panel hasta volver a AAL2:
- Usá los **códigos de recuperación** generados en el enrolamiento (SEC-002).
- Si tampoco los tenés: en el dashboard, **Auth → Users** → tu usuario → *Reset MFA factors* (o volvé a enrolar TOTP). Este acceso es de owner y no depende de la app.

## 4. Verificación técnica (SQL, opcional)

```sql
-- Con una sesión AAL1 de admin, la función debe devolver false:
select public.is_admin();       -- → false (sin AAL2)
select public.is_admin_aal2();  -- → false (sin AAL2)
select public.is_admin_role();  -- → true (rol admin, sin exigir AAL2)
```
```sql
-- Simular el claim aal2 en una prueba controlada:
select set_config('request.jwt.claims', '{"aal":"aal2","sub":"<admin-uid>"}', true);
select public.is_admin();  -- → true
```

## 5. Notas

- `service_role` (Edge Functions) bypassa RLS: no se ve afectado.
- Si más adelante se agregan nuevas policies de admin, deben usar `is_admin()` (ya endurecido) o `is_admin_aal2()`; **nunca** `is_admin_role()` para autorizar datos.
