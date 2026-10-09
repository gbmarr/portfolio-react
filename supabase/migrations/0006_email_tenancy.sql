-- ----------------------------------------------------------------------------
-- 0006_email_tenancy — consistencia de la tenancy por email (auditoría run-1)
--
-- Objetivo (decisión D2): si un usuario cambia su email de auth, mantener el
-- vínculo con sus datos. La tenancy se basa en
-- `lower(profiles.email) = projects.client_email`; hoy sólo existe un trigger en
-- `auth.users` INSERT (handle_new_user), así que un cambio de email desincroniza
-- el acceso del cliente a sus proyectos.
--
-- Cambios:
--   1. Índice único case-insensitive en `profiles.email` (evita duplicados).
--   2. Trigger en `auth.users` UPDATE que resincroniza `profiles.email` y
--      `projects.client_email`.
--
-- PRERREQUISITO antes de aplicar (si devuelve filas, resolver duplicados):
--   select lower(email) as email_norm, count(*)
--     from public.profiles group by 1 having count(*) > 1;
--
-- Cómo aplicar:
--   Opción A: Supabase Dashboard → SQL Editor → pegar y ejecutar.
--   Opción B: supabase CLI → `supabase db push` (requiere `supabase link`).
-- ----------------------------------------------------------------------------

-- 1) Unicidad case-insensitive de profiles.email ------------------------------
create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email));

-- 2) Resincronizar la tenancy ante un cambio de email de auth ------------------
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    -- el perfil del propio usuario (evita desincronía profiles.email <-> auth)
    update public.profiles
       set email = new.email
     where id = new.id;

    -- los proyectos asociados por email (preserva el acceso del cliente)
    update public.projects
       set client_email = lower(new.email)
     where client_email = lower(old.email);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
