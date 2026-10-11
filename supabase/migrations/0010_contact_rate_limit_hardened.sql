-- ----------------------------------------------------------------------------
-- 0010_contact_rate_limit_hardened — control de abuso robusto (SEC-003)
--
-- Debilidades corregidas de 0007/0008:
--   1. Fuente de IP no confiable: el trigger leía únicamente `x-forwarded-for`,
--      un header falsificable por el browser y ausente en algunas vías.
--   2. Fail-open: si no había IP, la función hacía `return new` (permitía
--      tráfico ilimitado desde esa "IP desconocida").
--   3. Sin límite global: un atacante con IPs rotativas o cabeceras falsas
--      eludía el límite por-IP.
--
-- Diseño nuevo (habilitado por SEC-001: la migración 0009 revocó el INSERT a
-- `anon` y `authenticated`, así que la única vía de INSERT es la Edge Function
-- `contact-notify` con service_role):
--   * La Edge Function obtiene la IP real del cliente desde headers puestos por
--     la plataforma en el borde (`cf-connecting-ip` / `x-real-ip`; no
--     falsificables por el browser) y la reenvía a PostgREST en `x-client-ip`
--     vía `setHeader`.
--   * El trigger lee `x-client-ip` primero, con fallback a `x-forwarded-for`
--     (primer valor de la cadena) por compatibilidad.
--   * FAIL-CLOSED: si no llega ninguna IP la request es anómala (la Edge
--     Function siempre la envía) -> se rechaza con el mismo mensaje de 429.
--   * Se conserva el límite estricto por-IP de 0008 (1 consulta/min) y se añade
--     un límite GLOBAL de seguridad (120 consultas/min en todo el sitio) que
--     corta floods multi-IP aunque el by-IP se evite. NAT compartido: usuarios
--     legítimos detrás de la misma IP comparten el límite por-IP; ante dudas,
--     120/min global es muy superior a cualquier uso real del formulario.
--
-- LÍMITE HONESTO: el rate-limit de PostgreSQL mitiga el abuso masivo; Turnstile
-- sigue siendo el control autoritativo del flujo real en la Edge Function.
--
-- Cómo aplicar: Supabase Dashboard -> SQL Editor (con backup previo).
-- ----------------------------------------------------------------------------

-- 1) Contador global single-row (sin policies: solo accesible por la función
-- SECURITY DEFINER como owner del esquema; ningún cliente directo).
create table if not exists public.contact_global_burst (
  id boolean primary key default true,
  window_start timestamptz not null default now(),
  hits int not null default 0
);
alter table public.contact_global_burst enable row level security;

-- 2) Trigger de throttling endurecido -----------------------------------------
create or replace function public.throttle_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
  v_row public.contact_rate_limits;
  v_global public.contact_global_burst;
  v_global_limit int := 120; -- máx. consultas/minuto en todo el sitio (anti-flood)
begin
  begin
    -- 1) IP confiable: `x-client-ip` (enviada por la Edge Function) con fallback
    --    al header estándar `x-forwarded-for`; primer valor de la cadena.
    v_ip := nullif(trim(split_part(coalesce(
      current_setting('request.headers', true)::json ->> 'x-client-ip',
      current_setting('request.headers', true)::json ->> 'x-forwarded-for',
      ''
    ), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  -- 2) FAIL-CLOSED (SEC-003): sin IP la request es anómala. La Edge Function
  --    siempre envía `x-client-ip`; la vía anónima ya no existe (0009).
  if v_ip is null then
    raise exception 'Demasiados envíos. Esperá un minuto e intentá de nuevo.';
  end if;

  -- 3) Límite por IP: 1 consulta/minuto (semántica estricta de 0008).
  select * into v_row from public.contact_rate_limits where ip = v_ip;
  if v_row.ip is not null and v_row.window_start >= now() - interval '1 minute' then
    raise exception 'Demasiados envíos. Esperá un minuto e intentá de nuevo.';
  end if;
  insert into public.contact_rate_limits (ip, window_start, hits)
  values (v_ip, now(), 1)
  on conflict (ip) do update
    set window_start = now(), hits = 1;

  -- 4) Límite global (red de seguridad, FR3).
  select * into v_global from public.contact_global_burst where id = true;
  if v_global.id is not null and v_global.window_start >= now() - interval '1 minute' then
    update public.contact_global_burst
       set hits = hits + 1
     where id = true
    returning * into v_global;
    if v_global.hits > v_global_limit then
      raise exception 'Demasiados envíos. Esperá un minuto e intentá de nuevo.';
    end if;
  else
    insert into public.contact_global_burst (id, window_start, hits)
    values (true, now(), 1)
    on conflict (id) do update
      set window_start = now(), hits = 1;
  end if;

  -- Limpieza oportuna de ventanas viejas (volumen chico).
  delete from public.contact_rate_limits where window_start < now() - interval '1 day';
  delete from public.contact_global_burst where window_start < now() - interval '1 day';

  return new;
end;
$$;

drop trigger if exists contact_messages_throttle on public.contact_messages;
create trigger contact_messages_throttle
  before insert on public.contact_messages
  for each row execute function public.throttle_contact_messages();