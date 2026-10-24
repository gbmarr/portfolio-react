-- =============================================================================
-- 0017_project_previews.sql
-- -----------------------------------------------------------------------------
-- Preview visual del avance del proyecto.
--
-- El admin publica capturas del sitio en un bucket privado y, opcionalmente,
-- un enlace externo (staging/Figma). El cliente las ve en /panel/:id.
--
-- Decisiones:
--   * Sin serverless: Storage + Postgres/RLS.
--   * Bucket privado: las imágenes se sirven con signed URLs de corta duración.
--   * `preview_url` solo HTTPS (evita javascript:/data:).
--   * Visibilidad por captura (`client_visible`), igual que las etapas.
--   * RLS por email del cliente, consistente con projects/stages/briefs.
--
-- Idempotente: IF NOT EXISTS / DROP POLICY IF EXISTS / ON CONFLICT.
-- Aplicar con Supabase Dashboard -> SQL Editor (con backup previo).
-- =============================================================================

-- 1) Enlace externo opcional por proyecto -------------------------------------
alter table public.projects
  add column if not exists preview_url text;

alter table public.projects
  add column if not exists preview_label text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_preview_url_https_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_preview_url_https_check
      check (
        preview_url is null
        or (preview_url ~ '^https://' and char_length(preview_url) <= 2048)
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'projects_preview_label_length_check'
      and conrelid = 'public.projects'::regclass
  ) then
    alter table public.projects
      add constraint projects_preview_label_length_check
      check (preview_label is null or char_length(preview_label) <= 80);
  end if;
end
$$;

comment on column public.projects.preview_url is
  'URL HTTPS de preview externo (staging, Figma, etc.). NULL si no hay.';
comment on column public.projects.preview_label is
  'Etiqueta visible del enlace de preview (máx. 80 caracteres).';

-- 2) Tabla de capturas ---------------------------------------------------------
create table if not exists public.project_previews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stage_id uuid references public.project_stages(id) on delete set null,
  storage_path text not null unique
    check (char_length(storage_path) between 1 and 512),
  caption text check (caption is null or char_length(caption) <= 200),
  position integer not null default 0 check (position >= 0),
  client_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists project_previews_project_position_idx
  on public.project_previews (project_id, position, created_at);

create index if not exists project_previews_stage_idx
  on public.project_previews (stage_id);

alter table public.project_previews enable row level security;

-- Admin (AAL2 vía is_admin()) gestiona todo.
drop policy if exists "admin gestiona previews" on public.project_previews;
create policy "admin gestiona previews"
  on public.project_previews for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cliente: solo capturas visibles de sus proyectos.
drop policy if exists "cliente ve previews de sus proyectos" on public.project_previews;
create policy "cliente ve previews de sus proyectos"
  on public.project_previews for select
  to authenticated
  using (
    client_visible
    and exists (
      select 1
      from public.projects p
      join public.profiles pr on lower(pr.email) = p.client_email
      where p.id = project_previews.project_id
        and pr.id = auth.uid()
    )
  );

-- Auditoría de cambios (mismo patrón que projects/stages/briefs).
drop trigger if exists project_previews_audit on public.project_previews;
create trigger project_previews_audit
  after insert or update or delete on public.project_previews
  for each row execute function public.audit_row();

-- 3) Bucket privado ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-previews',
  'project-previews',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Admin: lectura/escritura/borrado de objetos del bucket.
drop policy if exists "admin gestiona objetos de previews" on storage.objects;
create policy "admin gestiona objetos de previews"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'project-previews' and public.is_admin())
  with check (bucket_id = 'project-previews' and public.is_admin());

-- Cliente: solo lectura de objetos que correspondan a una captura visible
-- de un proyecto propio. La signed URL se genera con esta policy.
drop policy if exists "cliente lee objetos de previews visibles" on storage.objects;
create policy "cliente lee objetos de previews visibles"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-previews'
    and exists (
      select 1
      from public.project_previews pp
      join public.projects p on p.id = pp.project_id
      join public.profiles pr on lower(pr.email) = p.client_email
      where pp.storage_path = storage.objects.name
        and pp.client_visible
        and pr.id = auth.uid()
    )
  );
