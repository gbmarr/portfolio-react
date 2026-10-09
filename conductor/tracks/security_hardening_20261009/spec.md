# Spec — Hardening de seguridad (auditoría run-1)

> **Track ID:** `security_hardening_20261009`
> **Fuente:** auditoría `security-audit` run `portfolio-run-1` (source-only): 0 confirmados, 8 `needs_validation`, 1 rechazado.
> **Estado:** Propuesto — pendiente de aprobación del usuario (spec + plan).

---

## 1. Contexto y objetivo

La auditoría de seguridad del sistema (sitio público + panel admin + panel cliente + RLS + deploy) no confirmó vulnerabilidades explotables —no había sandbox OS para ejecutar—, pero dejó **8 leads `needs_validation`** y una lista de **hardening** concreto. Este track implementa los arreglos de bajo/medio riesgo que son válidos independientemente de la validación (defensa en profundidad), más un anexo de tareas de validación para que el dueño cierre los leads.

**Regla de oro (fair-use Hobby):** todo sigue siendo **client-side + Supabase (RLS)**. Cero serverless/functions. Los cambios que exigirían un backend (rate limiting server-side, captcha) quedan **fuera de alcance**.

Referencia de la auditoría (fuera del repo): `%USERPROFILE%\AppData\Local\Temp\opencode\security-audit-skill\portfolio\run-1\REPORT.md` (espejo del run en `.scratch/security-audit/run-1/`).

---

## 2. Hallazgos de origen y trazabilidad

| Fingerprint (auditoría) | Tipo | Fase que lo cubre |
|---|---|---|
| `supabase:project_briefs:update_policy:no_column_scope:service_type_extra_ids` | needs_validation | A.1 |
| `rls.project_stages.select.client_visible_not_enforced` | needs_validation | A.2 (+ A.4 por `notes`) |
| `contact-messages/anon-insert-unbounded-subject` | needs_validation | A.3 |
| `contact-messages/anon-insert-client-only-abuse-controls` | needs_validation (parcial) | A.3 neutraliza mass-assignment; el antispam server-side queda **fuera** |
| `messagespage.mailto.stored-email-href-injection` | needs_validation | B.1 |
| `deploy.vercelignore.missing-supabase-exclusion.auth-dump-build-context` | needs_validation | D |
| `form-submission/web3forms-access-key-client-bundled` | needs_validation | G (parcial) + validación del dueño |
| `auth.passkey-enrollment-no-step-up` | needs_validation | F |
| *(hardening)* tenancy por email + resync | hardening | E |
| `rls.milestone_approvals.upsert_update_policy_missing_project_ownership` | **rechazado** | — (no se toca; asimetría es defensa en profundidad, no cruce) |

---

## 3. Decisiones (confirmadas por el usuario el 2026-10-09)

| # | Tema | Decisión |
|---|------|----------|
| **D1** | Columna `project_stages.notes` | **Eliminar la columna** (muerta: no se lee ni edita; el código solo manda `null`). |
| **D2** | Cambio de email de auth | **Resincronizar `profiles.email` + `projects.client_email`** vía trigger en `auth.users UPDATE` (preserva el acceso del cliente). Refactor a tenancy por `profiles.id`: track futuro. |
| **D3** | Paso de re-autenticación para passkeys | **Diferir** hasta ejecutar V3 (validar la política AAL de Supabase); implementar re-auth solo si el proveedor no lo exige. |
| **D4** | `envPrefix`/nombres de env | **Solo documentar** en este track; renombrar a `PUBLIC_*` como follow-up con ventana de deploy. |

---

## 4. Fase A — Migración `0005_security_hardening.sql` (DB)

### A.1 `project_briefs`: columnas admin-only
Trigger que impide que un no-admin cambie `service_type`/`extra_ids` (el cliente solo escribe `answers`/`status`, como ya hace `updateBriefAnswers`).

```sql
create or replace function public.guard_brief_admin_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then return new; end if;
  if new.service_type is distinct from old.service_type
     or new.extra_ids   is distinct from old.extra_ids then
    raise exception 'service_type/extra_ids son administrados por el admin';
  end if;
  return new;
end; $$;

create trigger project_briefs_guard_admin_columns
  before update on public.project_briefs
  for each row execute function public.guard_brief_admin_columns();
```

### A.2 `project_stages`: respetar `client_visible` en RLS
Rehacer la policy de SELECT para que el cliente vea **solo** etapas `client_visible = true` (el admin ve todas):

```sql
drop policy if exists "cliente ve etapas de sus proyectos" on public.project_stages;
create policy "cliente ve etapas de sus proyectos"
  on public.project_stages for select
  to authenticated
  using (
    public.is_admin()
    or (
      client_visible
      and exists (
        select 1 from public.projects p
        join public.profiles pr on pr.id = auth.uid()
        where p.id = project_id and lower(pr.email) = p.client_email
      )
    )
  );
```

### A.3 `contact_messages`: acotar `subject` y neutralizar columnas de servidor
```sql
alter table public.contact_messages
  add constraint contact_messages_subject_len
  check (subject is null or char_length(subject) <= 200);

create or replace function public.normalize_contact_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.read_at := null;      -- el emisor no puede marcar como leído
  new.created_at := now();  -- el emisor no puede falsificar la fecha
  return new;
end; $$;

create trigger contact_messages_normalize
  before insert on public.contact_messages
  for each row execute function public.normalize_contact_message();
```

### A.4 (D1) Eliminar la columna muerta `notes`
```sql
alter table public.project_stages drop column if exists notes;
```

---

## 5. Fase B — Cliente / data layer

### B.1 `mailto:` seguro
En `src/pages/admin/MessagesPage.tsx:121`, el email almacenado se interpola sin codificar. Fix:
- Validar/normalizar el email en el borde (`ContactForm.handleSubmit`): rechazar si no matchea un patrón básico de email; recortar.
- Codificar el segmento de dirección al construir el href (además del `subject` ya codificado).
- Test que verifique que un email con `?`, `&`, `%0d%0a`, comillas se neutraliza.

### B.2 Quitar `notes` del tipo y del código (si D1 = a)
- `src/lib/types.ts`: quitar `'notes'` de la unión de claves (línea 44) y `notes: string | null` (57).
- `src/pages/admin/ProjectDetailPage.tsx` (196, 407): quitar `notes: null`.
- Ajustar tests que construyen `ProjectStage` con `notes: null`.

---

## 6. Fase C — Headers / CSP

### C.1 Quitar el handler inline de `index.html`
El `onload` inline (líneas 13-16) es lo único que obliga a `script-src-attr 'unsafe-inline'`. Reemplazar por carga de fuentes sin JS inline (link `stylesheet` estático + `preconnect`, se conserva el `noscript`).

### C.2 Endurecer CSP
Quitar `script-src-attr 'unsafe-inline'` de **ambos** `vercel.json` y `netlify.toml`. El resto de directivas queda igual.

### C.3 Guardrail
Test que asegure que `index.html` no contiene atributos de evento inline (`on*=`), para evitar reintroducir el `unsafe-inline`.

---

## 7. Fase D — Higiene de deploy (`.vercelignore`)

La lista actual (9 líneas) no excluye `supabase/`, que puede contener dumps con PII/credenciales en un deploy por upload local. Agregar exclusiones de árboles que no son parte del artefacto:

```gitignore
supabase
conductor
.agents
.opencode
.scratch
skills-lock.json
```

> No se toca `.gitignore` (ya cubre lo suyo). Se evaluará un `.netlifyignore` equivalente (no-op con `publish="dist"`).

---

## 8. Fase E — Tenancy por email (P1, D2)

### E.1 Migración `0006_email_tenancy.sql`
- Índice único `lower(email)` en `profiles` (evita duplicados por mayúsculas).
- Trigger `auth.users UPDATE` que resincroniza `profiles.email` y —según D2— `projects.client_email`.

```sql
create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email));

create or replace function public.handle_user_email_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
    -- D2 = (a): preservar acceso del cliente
    update public.projects set client_email = lower(new.email)
      where client_email = lower(old.email);
  end if;
  return new;
end; $$;

create trigger on_auth_user_email_updated
  after update on auth.users
  for each row execute function public.handle_user_email_change();
```

### E.2 Documentar
Nota en `conductor/tech-stack.md` sobre `profiles.email` como clave de tenancy y su resincronización.

---

## 9. Fase F — Passkey: paso de re-autenticación (P1, D3)

Si la validación (V3) confirma que Supabase no exige re-auth/AAL para `registerPasskey`/`deletePasskey`, exigir contraseña (o una sesión fresca) en el cliente antes de enrolar/borrar, en `src/lib/auth.tsx` + `AdminSecurityPage.tsx`, con test. Si Supabase ya lo exige, se documenta y se cierra.

---

## 10. Fase G — `envPrefix` (P1, D4)

Documentar en `.env.example`/`vite-env.d.ts` que **solo** valores públicos pueden usar los prefijos `FORM_`/`DATABASE_`, y dejar preparada la migración a `PUBLIC_*` como follow-up (D4 = b). Sin renombrar en este track para no romper el deploy.

---

## 11. Anexo — Plan de validación (lo ejecuta el dueño)

Estas tareas no modifican código; convierten leads `needs_validation` en `confirmed`/`rejected`.

| # | Qué validar | Cómo | Lead que cierra |
|---|---|---|---|
| V1 | Método de deploy real (Vercel CLI/upload vs Git integration) | Ver *Project Settings → Git* en Vercel | `.vercelignore` / dump |
| V2 | Web3Forms: domain-lock/referrer + cuota | Panel de Web3Forms | access-key |
| V3 | Supabase: passkeys habilitadas + política step-up/AAL | Authentication settings | passkey |
| V4 | Migraciones 0001–0004 aplicadas y RLS activo | SQL Editor: `select tablename, rowsecurity from pg_tables where schemaname='public'` | (base de todos) |
| V5 | `project_briefs` column-scope y `project_stages` visibility | Postgres+PostgREST local con las migraciones; PATCH/SELECT con usuario cliente dummy | briefs / stages |

---

## 12. Fuera de alcance

- **Antispam server-side** (rate limit/captcha/proof-of-work) para el formulario de contacto: exige serverless/functions — rompe el fair-use Hobby. Se documenta como decisión de arquitectura.
- Reutilización off-site de la Web3Forms key (config del proveedor).
- Rotación de credenciales y método de deploy (tareas del dueño).
- Escaneo de CVEs de dependencias (`npm audit`/OSV) — herramienta aparte.
- Tenancy por `profiles.id` (D2=c) — track futuro.
- Confirmar/atacar los leads: la auditoría no se re-ejecuta.

---

## 13. Riesgos

| Riesgo | Mitigación |
|---|---|
| Índice único `lower(email)` falla si hay duplicados existentes | Consultar duplicados antes de aplicar; resolver manualmente |
| Resincronizar `projects.client_email` mueve la tenancy de forma inesperada | D2 explícito + verificación del dueño; backup previo (patrón `supabase/backups/`) |
| Quitar `notes` rompe tests/render | Cambio atómico tipo+código+tests en el mismo commit |
| Cambiar CSP rompe la carga de fuentes | Probar en `preview` local + verificar la fuente carga antes de cerrar la fase |
| Migraciones no aplicadas en la DB remota | Aplicar con confirmación del usuario (`supabase db push --yes`); backup previo |

---

## 14. Criterios de aceptación

- [ ] Migración `0005` aplicada y verificada (briefs admin-only, `client_visible` en RLS, `subject` acotado, `read_at/created_at` normalizados, `notes` eliminada si D1=a).
- [ ] `mailto:` codifica el email; un valor malicioso no inyecta parámetros/headers.
- [ ] `index.html` sin handlers inline; CSP sin `script-src-attr 'unsafe-inline'` en `vercel.json` y `netlify.toml`.
- [ ] `.vercelignore` excluye los árboles no-release.
- [ ] (Si D2=a) Migración `0006` aplicada: `profiles.email` resincronizado; tenancy preservada.
- [ ] (Según D3) Paso de re-auth para passkeys implementado o documentado.
- [ ] Anexo de validación ejecutado por el dueño; cada lead marcado `confirmed`/`rejected`.
- [ ] `npm run build`, `lint`, `test`, `typecheck` en verde; cobertura ≥80%.
- [ ] `REPORT.md`/`NEEDS-VALIDATION.md` de la auditoría actualizados con el cierre de cada lead.
