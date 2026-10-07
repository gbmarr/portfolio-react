-- ============================================================================
-- 0001_init — Sistema de gestión (admin + panel de cliente)
--
-- Cómo aplicar:
--   Opción A: Supabase Dashboard → SQL Editor → pegar y ejecutar.
--   Opción B: supabase CLI → `supabase db push` (requiere `supabase link`).
--
-- Post-apply (bootstrap del admin):
--   1. Entrar al sitio con tu email en /login (magic link o contraseña).
--   2. Promover tu perfil:
--      update public.profiles set role = 'admin' where email = 'tu@email.com';
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PERFILES
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  phone text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Crea el perfil automáticamente cuando se crea el usuario (magic link/invite).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer para evitar la recursión de RLS al consultar profiles
-- desde policies de la misma tabla.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "leer perfil propio o ser admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "admin gestiona perfiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- PROYECTOS
--
-- Los proyectos se asocian al cliente por email (no por FK a profiles):
-- el perfil del cliente recién existe después de su primer login, y no hay
-- service role disponible para crear usuarios por adelantado. El cliente ve
-- sus proyectos cuando su email de auth coincide con client_email.
-- ----------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_email text not null check (client_email = lower(client_email) and char_length(client_email) between 3 and 254),
  title text not null check (char_length(title) between 2 and 160),
  type text not null default 'otro'
    check (type in ('web', 'landing', 'app', 'diseno', 'mantenimiento', 'otro')),
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  status text not null default 'en_progreso'
    check (status in ('lead', 'en_progreso', 'pausado', 'completado', 'cancelado')),
  start_date date,
  deadline date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index projects_client_email_idx
  on public.projects (client_email);

create policy "cliente lee sus proyectos"
  on public.projects for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(p.email) = client_email
    )
  );

create policy "admin crea proyectos"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy "admin actualiza proyectos"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin borra proyectos"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- ETAPAS (timeline de desarrollo)
-- ----------------------------------------------------------------------------
create table public.project_stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  description text,
  position integer not null default 0,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'en_progreso', 'revision', 'completada', 'bloqueada')),
  client_visible boolean not null default true,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index project_stages_project_position_idx
  on public.project_stages (project_id, position);

alter table public.project_stages enable row level security;

create policy "cliente ve etapas de sus proyectos"
  on public.project_stages for select
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

create policy "admin gestiona etapas"
  on public.project_stages for insert
  to authenticated
  with check (public.is_admin());

create policy "admin actualiza etapas"
  on public.project_stages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin borra etapas"
  on public.project_stages for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- MENSAJES DEL FORMULARIO DE CONTACTO (copia en panel)
-- El sitio público inserta sin sesión; solo el admin los lee.
-- ----------------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 120),
  message text not null check (char_length(message) between 10 and 2000),
  subject text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "cualquiera envía mensaje"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "solo admin lee mensajes"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "admin marca mensajes"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin borra mensajes"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- PAGOS (seña / saldo / extra por proyecto)
-- ----------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null default 'senal' check (kind in ('senal', 'saldo', 'extra')),
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'ARS' check (currency in ('ARS', 'USD')),
  status text not null default 'pendiente'
    check (status in ('pendiente', 'pagado', 'vencido')),
  due_date date,
  paid_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "cliente ve pagos de sus proyectos"
  on public.payments for select
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

create policy "admin gestiona pagos"
  on public.payments for insert
  to authenticated
  with check (public.is_admin());

create policy "admin actualiza pagos"
  on public.payments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin borra pagos"
  on public.payments for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- APROBACIÓN DE HITOS (el cliente aprueba/rechaza una etapa en revisión)
-- ----------------------------------------------------------------------------
create table public.milestone_approvals (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null unique references public.project_stages (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  decision text not null check (decision in ('aprobado', 'rechazado')),
  comment text check (comment is null or char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.milestone_approvals enable row level security;

-- Integridad: la etapa debe pertenecer al proyecto declarado.
create or replace function public.check_approval_stage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.project_stages s
    where s.id = new.stage_id and s.project_id = new.project_id
  ) then
    raise exception 'La etapa no pertenece al proyecto indicado';
  end if;
  return new;
end;
$$;

create trigger milestone_approvals_check_stage
  before insert or update on public.milestone_approvals
  for each row execute function public.check_approval_stage();

create policy "cliente ve decisiones de sus proyectos"
  on public.milestone_approvals for select
  to authenticated
  using (auth.uid() = client_id or public.is_admin());

create policy "cliente aprueba hitos de sus proyectos"
  on public.milestone_approvals for insert
  to authenticated
  with check (
    auth.uid() = client_id
    and exists (
      select 1
      from public.projects p
      join public.profiles pr on pr.id = auth.uid()
      where p.id = project_id and lower(pr.email) = p.client_email
    )
  );

create policy "cliente modifica su decisión"
  on public.milestone_approvals for update
  to authenticated
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "admin borra decisiones"
  on public.milestone_approvals for delete
  to authenticated
  using (public.is_admin());
