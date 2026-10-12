# CHECKLIST-OWNER — RT-03 (ownership en UPDATE de `milestone_approvals`)

> Track: `sec_approval_rls_20261012` · Issue: #28 · Migración: `0016_approval_update_ownership.sql`

Perfil: **owner** (acceso al dashboard de Supabase). Aplica la migración y verifica que el UPDATE de aprobaciones vuelva a validar la pertenencia del proyecto.

---

## 1. Aplicar la migración 0016 (obligatorio)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0016_approval_update_ownership.sql`.
3. Ejecutá. Debe terminar sin errores: dropea y recrea la policy `"cliente modifica su decisión"` sobre `milestone_approvals`.

> ⚠️ La migración es idempotente: podés ejecutarla más de una vez sin efecto acumulativo.

## 2. Verificación manual (en un proyecto de prueba)

Precondición: dos proyectos `P1` y `P2` con emails de cliente distintos (`c1@test.com`, `c2@test.com`), y el usuario `U1` con ese email `c1@test.com`.

1. Como `U1`, insertá una decisión sobre una etapa de **P1** (flujo legítimo):
   ```sql
   -- En el SQL Editor (simulando con la API del cliente en la app: "Aprobar hito")
   insert into public.milestone_approvals (stage_id, project_id, client_id, decision)
   values ('<etapa-de-P1>', '<P1>', '<U1>', 'aprobado');
   ```
   → Debe funcionar (INSERT con ownership).

2. Intentá apuntar tu decisión a un **proyecto ajeno** (el ataque que cierra RT-03):
   ```sql
   update public.milestone_approvals
      set project_id = '<P2>', stage_id = '<etapa-de-P2>'
    where client_id = '<U1>';
   ```
   → **Debe rechazarse** (0 filas actualizadas / policy violation).

3. Modificá tu decisión legítima (cambio de `decision` o `comment`) sobre una etapa de **P1**:
   ```sql
   update public.milestone_approvals
      set decision = 'rechazado', comment = 'cambio legítimo'
    where client_id = '<U1>' and project_id = '<P1>';
   ```
   → Debe funcionar (regresión del caso legítimo).

## 3. Sweep de integridad (datos existentes)

Por si el cambio llegó a concretarse antes de aplicar la migración, buscá aprobaciones cuyo `client_id` no corresponda al email del proyecto:

```sql
select ma.id, ma.project_id, p.client_email, pr.email as approver_email, ma.created_at
  from public.milestone_approvals ma
  join public.projects p        on p.id = ma.project_id
  join public.profiles  pr      on pr.id = ma.client_id
 where lower(pr.email) <> lower(p.client_email)
 order by ma.created_at desc;
```

→ Si devuelve filas, borrálas (o corregilas) manualmente; son decisiones ajenas.

## 4. Regression test

- `npm run test` (guard vial `src/approvalUpdateOwnership.test.ts` valida el SQL de la migración) y `npm run typecheck` / `npm run lint`.

## 5. Notas

- La policy de UPDATE sigue siendo **solo para clientes** (`to authenticated`): el admin no actualiza decisiones (borra/reinserta), comportamiento sin cambios.
- El trigger `check_approval_stage` (integridad etapa→proyecto) se conserva intacto; este track agrega la capa **proyecto→cliente** que faltaba.