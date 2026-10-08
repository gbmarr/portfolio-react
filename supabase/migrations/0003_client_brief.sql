-- ----------------------------------------------------------------------------
-- BRIEF DEL PROYECTO ("¿Qué vamos a necesitar?")
-- Checklist interactivo que el cliente completa desde su panel, derivado del
-- servicio (tiers del estimador) + extras que elige el admin al crear/editar
-- el proyecto. Sin archivos: las respuestas son texto/color/URL (MVP, ver
-- conductor/tracks/client_brief_20261008/spec.md).
-- ----------------------------------------------------------------------------
create table public.project_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  service_type text not null
    check (service_type in ('landing', 'institucional', 'medida')),
  extra_ids jsonb not null default '[]',
  -- Respuestas del cliente: { fieldId: value } según src/data/briefTemplates.ts
  answers jsonb not null default '{}',
  -- Autocalculado en el cliente: 'completado' si todos los obligatorios respondidos
  status text not null default 'pendiente'
    check (status in ('pendiente', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_briefs_project_idx
  on public.project_briefs (project_id);

alter table public.project_briefs enable row level security;

-- El cliente lee el brief de sus proyectos; el admin ve todos.
create policy "cliente lee brief de sus proyectos"
  on public.project_briefs for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  );

create policy "admin crea briefs"
  on public.project_briefs for insert
  to authenticated
  with check (public.is_admin());

-- El cliente actualiza sus respuestas/estado; el admin ajusta servicio/extras.
create policy "cliente actualiza brief de sus proyectos"
  on public.project_briefs for update
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  );

create policy "admin borra briefs"
  on public.project_briefs for delete
  to authenticated
  using (public.is_admin());

create trigger project_briefs_updated_at
  before update on public.project_briefs
  for each row execute function public.set_updated_at();