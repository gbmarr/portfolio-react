-- ----------------------------------------------------------------------------
-- 0014_audit_log — trazabilidad de acciones sensibles (RT-04)
--
-- Contexto (red team 2026-10-12, hallazgo RT-04 / CWE-778): no existía audit_log,
-- así que un abuso con un token admin (ver RT-01, 0013_admin_aal2.sql) era
-- INDISTINGUIBLE de una operación legítima: no se podía detectar ni investigar.
-- Este track aporta la capacidad de DETECCIÓN ("¿lo habríamos visto?").
--
-- Qué hace:
--   1. Crea public.audit_log (actor, acción, entidad, metadata ACOTADA, IP, fecha).
--   2. audit_row(): trigger genérico AFTER INSERT/UPDATE/DELETE. En UPDATE guarda
--      solo los NOMBRES de las columnas modificadas (no los valores) para no
--      duplicar PII (NFR2).
--   3. Instala el trigger en projects, project_stages, project_briefs,
--      milestone_approvals, contact_messages y profiles.
--   4. RLS: SELECT solo admin (public.is_admin() exige AAL2 tras RT-01); no hay
--      policy de INSERT/UPDATE/DELETE y se revocan esos privilegios, de modo que
--      anon/authenticated no tienen ninguna vía directa de escritura. La escritura
--      legítima la hacen los triggers (SECURITY DEFINER) que corren como owner.
--   5. public.prune_audit_log(): limpieza por retención (90 días por defecto).
--
-- Cómo aplicar: Supabase Dashboard -> SQL Editor (con backup previo).
-- Idempotente (create ... if not exists / create or replace / drop trigger if exists).
--
-- Coordinación: esta migración asume RT-01 (0013) para que la lectura de admin
-- exija AAL2. Sin 0013 la lectura queda solo-admin (sin exigir AAL2), que no es
-- peor que hoy, pero se recomienda aplicar 0013 primero.
-- ----------------------------------------------------------------------------

-- 1) Tabla append-only ---------------------------------------------------------
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);
create index if not exists audit_log_entity_idx     on public.audit_log (entity, created_at desc);
create index if not exists audit_log_actor_idx      on public.audit_log (actor_id, created_at desc);

comment on table public.audit_log is
  'Registro append-only de acciones sensibles (RT-04). SELECT solo admin (AAL2 tras RT-01); INSERT solo vía triggers. Retención sugerida: 90 días (public.prune_audit_log).';

-- 2) Función de auditoría genérica --------------------------------------------
create or replace function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action      text;
  v_row         jsonb;
  v_entity_id   text;
  v_actor_id    uuid;
  v_actor_email text;
  v_ip          text;
  v_changed     jsonb := '[]'::jsonb;
  v_metadata    jsonb := '{}'::jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_row := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_row := to_jsonb(new);

    -- Solo NOMBRES de columnas modificadas (sin volcar valores -> sin PII).
    select coalesce(jsonb_agg(n.key order by n.key), '[]'::jsonb)
      into v_changed
      from jsonb_each(to_jsonb(new)) n
     where n.value is distinct from (to_jsonb(old) -> n.key);
  else
    v_action := 'delete';
    v_row := to_jsonb(old);
  end if;

  v_entity_id := v_row ->> 'id';

  -- Actor: la identidad de la sesión que provocó el cambio (si la hay).
  v_actor_id := auth.uid();
  if v_actor_id is not null then
    select p.email into v_actor_email from public.profiles p where p.id = v_actor_id;
  end if;

  -- IP: PostgREST expone los headers como GUC (mismo tratamiento que el throttle).
  begin
    v_ip := nullif(trim(split_part(
      coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
      ',', 1)), '');
  exception when others then
    v_ip := null;
  end;

  if v_action = 'update' then
    v_metadata := jsonb_build_object('changed', v_changed);
  end if;

  insert into public.audit_log (actor_id, actor_email, action, entity, entity_id, metadata, ip)
  values (v_actor_id, v_actor_email, v_action, tg_table_name, v_entity_id, v_metadata, v_ip);

  return null;  -- trigger AFTER: el valor de retorno se ignora
end;
$$;

comment on function public.audit_row() is
  'Trigger genérico de auditoría (RT-04): registra INSERT/UPDATE/DELETE en public.audit_log. En UPDATE guarda solo los nombres de columnas cambiadas (sin valores).';

-- 3) Triggers por tabla sensible ----------------------------------------------
drop trigger if exists projects_audit on public.projects;
create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.audit_row();

drop trigger if exists project_stages_audit on public.project_stages;
create trigger project_stages_audit
  after insert or update or delete on public.project_stages
  for each row execute function public.audit_row();

drop trigger if exists project_briefs_audit on public.project_briefs;
create trigger project_briefs_audit
  after insert or update or delete on public.project_briefs
  for each row execute function public.audit_row();

drop trigger if exists milestone_approvals_audit on public.milestone_approvals;
create trigger milestone_approvals_audit
  after insert or update or delete on public.milestone_approvals
  for each row execute function public.audit_row();

drop trigger if exists contact_messages_audit on public.contact_messages;
create trigger contact_messages_audit
  after insert or update or delete on public.contact_messages
  for each row execute function public.audit_row();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_row();

-- 4) RLS y privilegios ---------------------------------------------------------
-- Lectura: solo admin (public.is_admin() exige AAL2 tras RT-01).
drop policy if exists "solo admin lee audit_log" on public.audit_log;
create policy "solo admin lee audit_log"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- Escritura: sin policy -> denegada por RLS. Refuerzo con REVOKE (aunque hubiera
-- policy, anon/authenticated no tienen privilegio). El INSERT lo hacen los
-- triggers SECURITY DEFINER (owner), que bypassan RLS.
revoke insert, update, delete on public.audit_log from anon, authenticated;
grant select on public.audit_log to authenticated;

-- 5) Retención -----------------------------------------------------------------
create or replace function public.prune_audit_log(p_days int default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.audit_log
   where created_at < now() - make_interval(days => greatest(p_days, 1));
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

comment on function public.prune_audit_log(int) is
  'Borra public.audit_log con antigüedad > p_days (default 90). Programar con pg_cron o ejecutar manualmente (ver CHECKLIST-OWNER.md).';
