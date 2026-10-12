# CHECKLIST-OWNER — RT-02 (cerrar self-signup + validar `client_email`)

> Track: `sec_signup_lockdown_20261012` · Issue: #27 · Migración: `0015_client_email_valid.sql`

Perfil: **owner** (acceso al dashboard de Supabase). Cierra el self-signup por API (acción de config) y aplica la validación de base.

---

## 0. Modelo confirmado

El sitio es **invite-only** por diseño: el login NO crea cuentas (`shouldCreateUser: false`, `src/lib/auth.tsx`) y las cuentas de clientes se crean solo por la invitación del admin (`inviteByMagicLink`). Si eso cambia alguna vez, re-evaluar.

## 1. Activar `disable_signup` (obligatorio — cierra el self-signup por API)

El hallazgo: `/auth/v1/otp?create_user=true` con la publishable key creaba cuentas aunque la UI no lo ofreciera.

1. Supabase Dashboard → **Authentication → Sign In / Up** (Provider Settings).
2. Desactivá **"Allow new users to sign up"** (equivale a `disable_signup: true` en GoTrue).
3. Verificá que **Admin API** / invite no se ven afectadas (el invite usa el endpoint de admin con `service_role`, no el público).

> ⚠️ Con `disable_signup` activo, `POST /auth/v1/otp` con `create_user=true` para un email nuevo devuelve error (`Signups not allowed`). Verificarlo:

```http
POST https://<ref>.supabase.co/auth/v1/otp
Content-Type: application/json
apikey: <publishable>

{ "email": "nadie@nuevo-dominio-inexistente.com", "create_user": true }
```
→ Debe devolver **4xx** y **no** crear el usuario (chequear en Auth → Users).

## 2. Invitación del admin (regresión — no romper el flujo)

Después del cambio, desde `/admin/clientes` reenviá una invitación (o invitá a un email nuevo):
- Debe seguir enviándose el email y crearse la cuenta al primer ingreso (flujo `inviteByMagicLink`, `shouldCreateUser: true`).
- Si querés validar antes en staging: repetí la verificación de arriba con `create_user=true` y confirmá que la cuenta se crea **solo** con el flujo de invitación.

## 3. Aplicar la migración 0015 (obligatorio)

1. Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá `supabase/migrations/0015_client_email_valid.sql` y ejecutá.
3. Consultá si hay datos sucios previos (si devuelve filas, hay que corregirlas antes de validar el constraint global):

```sql
select id, client_email from public.projects
 where not public.is_valid_email(client_email);
```

4. Si está vacío (o tras corregir), exigí el chequeo global:
```sql
alter table public.projects validate constraint projects_client_email_valid;
```

## 4. Verificación manual

- Alta/edición de proyecto en `/admin/proyectos/nuevo`:
  - Email inválido (`no-soy-email`) → mensaje **"El email del cliente no es válido."** y no guarda.
  - Email con mayúsculas (`Panaderia@Example.com`) → se guarda como `panaderia@example.com` (normalizado).
- Opcional, por API (debe rechazar por el CHECK):
  ```sql
  insert into public.projects (client_email, title, type)
  values ('no-valido', 'Prueba RT-02', 'web');
  -- → error: new row for relation "projects" violates check constraint
  --   "projects_client_email_valid"
  ```

## 5. Notas

- `disable_signup` es acción de configuración (no es una migración): si se usa el modelo actual (*invite-only*) debe permanecer desactivado el registro público.
- Si en el futuro se permite auto-registro, revisar de nuevo RT-02 (una cuenta propia sobre un `client_email` ajeno sigue siendo tenancy por email sin FK).