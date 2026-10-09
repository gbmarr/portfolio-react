-- ----------------------------------------------------------------------------
-- 0005_security_hardening — endurecimiento de RLS/esquema (auditoría run-1)
--
-- Corrige hallazgos `needs_validation` de la auditoría security-audit (run-1):
--   1. project_briefs: service_type/extra_ids solo los cambia el admin.
--   2. project_stages: el cliente solo ve etapas con client_visible = true.
--   3. project_stages.notes: columna muerta (no se lee ni edita) — se elimina.
--   4. contact_messages: subject acotado; read_at/created_at no falsificables.
--
-- Cómo aplicar:
--   Opción A: Supabase Dashboard → SQL Editor → pegar y ejecutar.
--   Opción B: supabase CLI → `supabase db push` (requiere `supabase link`).
--
-- IMPORTANTE (deploy acoplado): el punto 3 requiere desplegar junto el cambio de
-- código que deja de enviar `notes` (ver plan Fase B.5), para no romper el alta/
-- edición de etapas.
-- ----------------------------------------------------------------------------

-- 1) project_briefs: columnas administradas por el admin ----------------------
-- El cliente puede escribir answers/status; service_type/extra_ids son del admin.
create or replace function public.guard_brief_admin_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.service_type is distinct from old.service_type
     or new.extra_ids is distinct from old.extra_ids then
    raise exception 'service_type/extra_ids son administrados por el administrador';
  end if;
  return new;
end;
$$;

drop trigger if exists project_briefs_guard_admin_columns on public.project_briefs;
create trigger project_briefs_guard_admin_columns
  before update on public.project_briefs
  for each row execute function public.guard_brief_admin_columns();

-- 2) project_stages: respetar client_visible en el SELECT del cliente ---------
-- El admin sigue viendo todas; el cliente solo las marcadas como visibles.
drop policy if exists "cliente ve etapas de sus proyectos" on public.project_stages;
create policy "cliente ve etapas de sus proyectos"
  on public.project_stages for select
  to authenticated
  using (
    public.is_admin()
    or (
      client_visible
      and exists (
        select 1
        from public.projects p
        join public.profiles pr on pr.id = auth.uid()
        where p.id = project_id and lower(pr.email) = p.client_email
      )
    )
  );

-- 3) project_stages.notes: columna muerta -------------------------------------
alter table public.project_stages drop column if exists notes;

-- 4) contact_messages: acotar subject y neutralizar columnas de servidor -------
alter table public.contact_messages
  drop constraint if exists contact_messages_subject_len;
alter table public.contact_messages
  add constraint contact_messages_subject_len
  check (subject is null or char_length(subject) <= 200);

create or replace function public.normalize_contact_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.read_at := null;      -- el emisor no puede marcar como leído
  new.created_at := now();  -- el emisor no puede falsificar la fecha
  return new;
end;
$$;

drop trigger if exists contact_messages_normalize on public.contact_messages;
create trigger contact_messages_normalize
  before insert on public.contact_messages
  for each row execute function public.normalize_contact_message();
