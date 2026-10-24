-- =============================================================================
-- 0018_quote_requests.sql
-- -----------------------------------------------------------------------------
-- Solicitudes de presupuesto desde la landing (sin precios públicos).
--
-- Decisiones:
--   * No hay columnas de dinero: el presupuesto lo arma y lo envía el owner.
--   * La única vía de INSERT es la Edge Function `contact-notify` con
--     service_role (kind = 'quote'); anon/authenticated no pueden insertar.
--   * El email se guarda normalizado; el rate-limit por email usa un hash,
--     no el email en claro.
--   * Rate-limit fail-closed: 1/min por IP, 3/hora por email y 60/hora global.
--   * RLS: solo admin (AAL2 vía is_admin()) puede leer, actualizar o borrar.
--
-- Idempotente: IF NOT EXISTS / DROP ... IF EXISTS / CREATE OR REPLACE.
-- Aplicar con Supabase Dashboard -> SQL Editor (con backup previo).
-- =============================================================================

-- 1) Tabla de solicitudes ------------------------------------------------------

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  tier text not null,
  sections integer not null default 0,
  extras text[] not null default '{}',
  notes text,
  consent_at timestamptz not null,
  consent_version text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  contacted_at timestamptz,
  constraint quote_requests_name_check
    check (
      char_length(name) between 1 and 80
      and name !~ '[[:cntrl:]]'
    ),
  constraint quote_requests_email_check
    check (
      char_length(email) between 1 and 120
      and email = lower(email)
      and email !~ '[[:cntrl:]]'
      and public.is_valid_email(email)
    ),
  constraint quote_requests_tier_check
    check (tier in ('landing', 'institucional', 'medida')),
  constraint quote_requests_sections_check
    check (
      (tier = 'institucional' and sections between 3 and 8)
      or (tier in ('landing', 'medida') and sections = 0)
    ),
  constraint quote_requests_extras_check
    check (
      cardinality(extras) <= 20
      and extras <@ array[
        'blog',
        'integraciones',
        'multidioma',
        'logo',
        'copy',
        'ecommerce',
        'seo'
      ]::text[]
    ),
  constraint quote_requests_notes_check
    check (
      notes is null
      or (
        char_length(notes) <= 1000
        and translate(notes, E'\n\t', '') !~ '[[:cntrl:]]'
      )
    ),
  constraint quote_requests_consent_version_check
    check (char_length(consent_version) between 1 and 20),
  constraint quote_requests_status_check
    check (status in ('new', 'contacted', 'closed'))
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

create index if not exists quote_requests_status_idx
  on public.quote_requests (status, created_at desc);

create index if not exists quote_requests_email_idx
  on public.quote_requests (email);

comment on table public.quote_requests is
  'Solicitudes de presupuesto de la landing. Sin montos: el owner responde manualmente.';
comment on column public.quote_requests.extras is
  'IDs de extras del estimador; validados también por el contrato compartido.';
comment on column public.quote_requests.consent_version is
  'Versión del consentimiento aceptado (ej. 2026-10-24).';

alter table public.quote_requests enable row level security;

-- Admin (AAL2 vía is_admin()) puede leer, actualizar estado y borrar spam.
drop policy if exists "admin gestiona presupuestos" on public.quote_requests;
create policy "admin gestiona presupuestos"
  on public.quote_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- El INSERT queda reservado a service_role (Edge Function). El admin no crea
-- solicitudes desde el panel: solo las gestiona.
revoke all on public.quote_requests from anon, authenticated;
grant select, update, delete on public.quote_requests to authenticated;

-- 2) Rate-limit por IP, por email y global -------------------------------------

create table if not exists public.quote_ip_rate_limits (
  ip text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table public.quote_ip_rate_limits enable row level security;

create table if not exists public.quote_email_rate_limits (
  email_hash text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table public.quote_email_rate_limits enable row level security;

create table if not exists public.quote_global_burst (
  id boolean primary key default true,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table public.quote_global_burst enable row level security;

create or replace function public.throttle_quote_requests()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
  v_email_hash text;
  v_ip_row public.quote_ip_rate_limits;
  v_email_row public.quote_email_rate_limits;
  v_global public.quote_global_burst;
  v_global_limit int := 60;
begin
  begin
    v_ip := nullif(trim(split_part(coalesce(
      current_setting('request.headers', true)::json ->> 'x-client-ip',
      current_setting('request.headers', true)::json ->> 'x-forwarded-for',
      ''
    ), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  -- Fail-closed: la Edge Function siempre envía x-client-ip.
  if v_ip is null then
    raise exception 'Demasiadas solicitudes. Esperá un minuto e intentá de nuevo.';
  end if;

  -- 1/min por IP.
  select * into v_ip_row from public.quote_ip_rate_limits where ip = v_ip;
  if v_ip_row.ip is not null and v_ip_row.window_start >= now() - interval '1 minute' then
    raise exception 'Demasiadas solicitudes. Esperá un minuto e intentá de nuevo.';
  end if;
  insert into public.quote_ip_rate_limits (ip, window_start, hits)
  values (v_ip, now(), 1)
  on conflict (ip) do update
    set window_start = now(), hits = 1;

  -- 3/hora por email (hash con md5, sin guardar el email en esta tabla).
  v_email_hash := md5(lower(new.email));
  select * into v_email_row
    from public.quote_email_rate_limits
   where email_hash = v_email_hash;
  if v_email_row.email_hash is not null
     and v_email_row.window_start >= now() - interval '1 hour' then
    if v_email_row.hits >= 3 then
      raise exception 'Demasiadas solicitudes. Esperá una hora e intentá de nuevo.';
    end if;
    update public.quote_email_rate_limits
       set hits = hits + 1
     where email_hash = v_email_hash;
  else
    insert into public.quote_email_rate_limits (email_hash, window_start, hits)
    values (v_email_hash, now(), 1)
    on conflict (email_hash) do update
      set window_start = now(), hits = 1;
  end if;

  -- 60/hora global (anti-flood multi-IP).
  select * into v_global from public.quote_global_burst where id = true;
  if v_global.id is not null
     and v_global.window_start >= now() - interval '1 hour' then
    update public.quote_global_burst
       set hits = hits + 1
     where id = true
    returning * into v_global;
    if v_global.hits > v_global_limit then
      raise exception 'Demasiadas solicitudes. Esperá una hora e intentá de nuevo.';
    end if;
  else
    insert into public.quote_global_burst (id, window_start, hits)
    values (true, now(), 1)
    on conflict (id) do update
      set window_start = now(), hits = 1;
  end if;

  delete from public.quote_ip_rate_limits
   where window_start < now() - interval '1 day';
  delete from public.quote_email_rate_limits
   where window_start < now() - interval '1 day';
  delete from public.quote_global_burst
   where window_start < now() - interval '1 day';

  return new;
end;
$$;

drop trigger if exists quote_requests_throttle on public.quote_requests;
create trigger quote_requests_throttle
  before insert on public.quote_requests
  for each row execute function public.throttle_quote_requests();
