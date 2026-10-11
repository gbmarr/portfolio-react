-- ----------------------------------------------------------------------------
-- 0008_contact_rate_limit_strict — anti-abuse 1 consulta/min por IP
--
-- Tras verificar el envío real (email OK vía Resend), el dueño pidió bajar el
-- límite de 6/min (0007: `hits > 5`) a **1 consulta por minuto por IP**.
-- Conserva la misma tabla `contact_rate_limits` y el mismo trigger; solo
-- re-crea la función `throttle_contact_messages` con la semántica estricta:
--   * sin fila previa            -> permitido (primer envío), inicia contador
--   * ventana > 1 minuto         -> permitido, reinicia contador
--   * ventana vigente con envío  -> RECHAZADO (raise -> 429 vía contact-notify)
-- El mensaje exacto 'Demasiados envíos...' es el que la Edge Function
-- `contact-notify` reconoce para responder 429 (rate-limited).
--
-- LÍMITE HONESTO (igual que 0007): `x-forwarded-for` es falsificable por un
-- cliente directo; esto sube el costo del abuso, no es una autorización
-- perfecta. Turnstile es el control autoritativo del flujo real.
--
-- Cómo aplicar: Supabase Dashboard -> SQL Editor (con backup previo).
-- ----------------------------------------------------------------------------

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

  select * into v_row from public.contact_rate_limits where ip = v_ip;

  -- Primer envío, o pasó más de 1 minuto desde la ventana actual: permitir y
  -- (re)iniciar el contador. Esta rama habilita exactamente 1 consulta/min/IP.
  if v_row.ip is null or v_row.window_start < now() - interval '1 minute' then
    insert into public.contact_rate_limits (ip, window_start, hits)
    values (v_ip, now(), 1)
    on conflict (ip) do update
      set window_start = now(), hits = 1;
    return new;
  end if;

  -- Ya hubo un envío en la ventana vigente: rechazar.
  raise exception 'Demasiados envíos. Esperá un minuto e intentá de nuevo.';
end;
$$;

drop trigger if exists contact_messages_throttle on public.contact_messages;
create trigger contact_messages_throttle
  before insert on public.contact_messages
  for each row execute function public.throttle_contact_messages();