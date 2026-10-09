-- ----------------------------------------------------------------------------
-- 0007_contact_rate_limit — anti-abuse del formulario de contacto (auditoría run-1)
--
-- Mitiga el lead `contact-messages/anon-insert-client-only-abuse-controls` SIN
-- serverless, con PostgreSQL:
--   1. Rate limit por IP: PostgREST expone los headers de la request como GUC
--      (`request.headers`); el trigger limita inserciones anónimas por IP
--      (x-forwarded-for) a 5/min.
--   2. `subject` forzado a NULL: el formulario nunca lo envía; cierra el
--      mass-assign y el campo ilimitado (sustituye al CHECK de longitud de 0005).
--
-- LÍMITE HONESTO: `x-forwarded-for` es una cabecera que un cliente directo puede
-- falsificar (mandando la suya propia), así que esto sube el costo del abuso pero
-- no es una autorización perfecta. Es una mitigación, no un control definitivo;
-- un control definitivo exigiría una función serverless (ver track own_email).
--
-- Cómo aplicar: Supabase Dashboard → SQL Editor (con backup previo).
-- ----------------------------------------------------------------------------

-- 1) Tabla de acumulación por IP ---------------------------------------------
create table if not exists public.contact_rate_limits (
  ip text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);
alter table public.contact_rate_limits enable row level security;
-- Sin policies: la única vía de acceso es la función SECURITY DEFINER
-- (el owner del esquema), nunca un cliente directo.

-- 2) Trigger de throttling -----------------------------------------------------
create or replace function public.throttle_contact_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
  v_row public.contact_rate_limits;
begin
  begin
    v_ip := nullif(trim(split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  -- Sin IP identificable no se puede acotar: se permite (no bloquear el sitio).
  if v_ip is null then
    return new;
  end if;

  insert into public.contact_rate_limits as c (ip) values (v_ip)
  on conflict (ip) do update
    set hits = case when c.window_start < now() - interval '1 minute' then 1
                    else c.hits + 1 end,
        window_start = case when c.window_start < now() - interval '1 minute' then now()
                            else c.window_start end
  returning * into v_row;

  if v_row.hits > 5 then
    raise exception 'Demasiados envíos. Esperá un minuto e intentá de nuevo.';
  end if;

  -- Limpieza oportuna de ventanas viejas (tabla de volumen chico).
  delete from public.contact_rate_limits where window_start < now() - interval '1 day';

  return new;
end;
$$;

drop trigger if exists contact_messages_throttle on public.contact_messages;
create trigger contact_messages_throttle
  before insert on public.contact_messages
  for each row execute function public.throttle_contact_messages();

-- 3) subject: solo NULL (el formulario nunca lo envía) --------------------------
alter table public.contact_messages
  drop constraint if exists contact_messages_subject_len;
alter table public.contact_messages
  add constraint contact_messages_subject_null check (subject is null);