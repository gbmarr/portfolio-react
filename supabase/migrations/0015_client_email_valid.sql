-- ----------------------------------------------------------------------------
-- 0015_client_email_valid — validación estructural de projects.client_email (RT-02)
--
-- Contexto (red team 2026-10-12, RT-02 / CWE-287): la tenancy de cliente se
-- resuelve por email (`projects.client_email`, sin FK a profiles). Una cuenta
-- creada por self-signup sobre un email cargado por el admin (o un typo) daba
-- acceso a ese proyecto. La migración complementa el cierre del self-signup
-- (owner: `disable_signup`) con:
--   1. `public.is_valid_email(text)` — función inmutable que espeja el SAFE_EMAIL
--      de la Edge Function contact-notify (criterio único y conservador).
--   2. CHECK `projects_client_email_valid` que exige validez estructural en el
--      alta/edición de proyectos (defensa en profundidad, FR3).
--
-- La CHECK existente de la columna (0001) ya exige `client_email = lower(...)`
-- y longitud 3-254. Esta migración suma la validez estructural SIN romper filas
-- históricas: el constraint se agrega como NOT VALID (no revisa filas viejas,
-- pero se cumple para todo insert/update nuevo). Una vez confirmado que no hay
-- datos sucios, se puede exigir el chequeo global:
--   alter table public.projects validate constraint projects_client_email_valid;
--
-- Cómo aplicar: Supabase Dashboard -> SQL Editor (con backup previo).
-- Idempotente (create or replace / drop constraint if exists).
-- ----------------------------------------------------------------------------

-- 1) Función de validación estructural (immutable -> usable en CHECK) ----------
create or replace function public.is_valid_email(value text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select value ~ '^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
$$;

comment on function public.is_valid_email(text) is
  'Valida estructuralmente un email (RT-02). Espejo del SAFE_EMAIL de contact-notify; no verifica entregabilidad.';

-- 2) CHECK estructural en projects.client_email --------------------------------
alter table public.projects
  drop constraint if exists projects_client_email_valid;

alter table public.projects
  add constraint projects_client_email_valid
  check (public.is_valid_email(client_email)) not valid;

-- Consulta de limpieza previa a VALIDATE (si devuelve filas, decidir antes):
--   select id, client_email from public.projects
--    where not public.is_valid_email(client_email);