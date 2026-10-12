-- ----------------------------------------------------------------------------
-- 0013_admin_aal2 — la autorización de admin exige AAL2 (RT-01)
--
-- Contexto: la MFA del admin (SEC-002) se aplica SOLO en el cliente
-- (`src/routes/guards.tsx`). La autorización real vive en RLS, pero
-- `public.is_admin()` solo comprobaba `profiles.role = 'admin'`; ninguna policy
-- miraba el nivel de autenticación. Un token AAL1 (p. ej. password grant sin
-- TOTP, `POST /auth/v1/token?grant_type=password`) accedía a TODO el panel vía
-- PostgREST, saltándose la UI de step-up.
--
-- Esta migración endurece la autorización en un ÚNICO choke point:
--   * se crea `is_admin_aal2()` = rol admin Y `auth.jwt()->>'aal' = 'aal2'`;
--   * `is_admin()` pasa a delegar en él.
-- Así, todas las policies y triggers que ya usan `is_admin()` quedan endurecidos
-- sin reescribir cada policy (verificado: supabase/migrations/0001, 0003, 0005, 0011).
--
-- Notas:
--   * `service_role` (Edge Functions) bypassa RLS: no se ve afectado.
--   * El admin en AAL1 conserva la lectura de SU PROPIO perfil (policy
--     `auth.uid() = id or is_admin()`), necesario para conocer su rol y ser
--     redirigido al step-up en `/admin/mfa`.
--   * Supabase incluye el claim `aal` (aal1/aal2) en el access token.
--
-- Idempotente (create or replace). Cómo aplicar:
--   Supabase Dashboard -> SQL Editor (con backup previo).
--   Debe aplicarse JUNTO con el deploy del código del track
--   `sec_admin_mfa_rls_20261012` (issue #25).
-- ----------------------------------------------------------------------------

-- 1) Nueva autoridad: admin con sesión AAL2 -----------------------------------
create or replace function public.is_admin_aal2()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
  and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

comment on function public.is_admin_aal2() is
  'True si el usuario es admin (profiles.role) y su sesion es AAL2 (auth.jwt()->>''aal''). RT-01.';

-- 2) Choke point: `is_admin()` pasa a exigir AAL2 -----------------------------
--    (toda policy/trigger que ya llama `is_admin()` queda endurecido)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_admin_aal2();
$$;

comment on function public.is_admin() is
  'Autorizacion de admin endurecida (RT-01): delega en is_admin_aal2() (rol admin + AAL2).';

-- 3) Rol admin sin AAL2 (solo informativo) ------------------------------------
--    Se expone por claridad; NO se usa en policies a propósito (autorizar datos
--    siempre debe requerir AAL2).
create or replace function public.is_admin_role()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

comment on function public.is_admin_role() is
  'Rol admin SIN exigir AAL2. Informativo/bootstrap; NO usar para autorizar datos.';
