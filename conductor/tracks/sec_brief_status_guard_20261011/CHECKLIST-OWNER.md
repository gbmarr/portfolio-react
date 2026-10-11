# CHECKLIST-OWNER — SEC-006 (status del brief derivado en la base)

> Track: `sec_brief_status_guard_20261011` · Issue: #12 · Migración: `0011_brief_status_derive.sql`

Perfil: **owner** (acceso al dashboard de Supabase). Solo vos podés aplicar este paso; luego el track queda cerrado.

---

## 1. Aplicar la migración 0011 (obligatorio para que el control exista)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0011_brief_status_derive.sql`.
3. Ejecutá. Debería terminar sin errores: crea `brief_answer_ok(jsonb)`, `compute_brief_status(text,jsonb,jsonb)` y recrea `guard_brief_admin_columns()`.

**Qué hace:** a partir de ahora, cuando actualiza un no-admin, la base **ignora el `status` que mande el cliente** y lo recalcula desde `answers` con las mismas reglas que `computeBriefStatus()` del frontend:
- `'completado'` si están respondidos todos los campos obligatorios del servicio (landing/institucional/medida) y de los extras seleccionados.
- `'pendiente'` en cualquier otro caso (aunque el cliente envíe `status='completado'`).

> ⚠️ **Deploy acoplado:** esta migración debe aplicarse **junto con** el cambio de código que hace que `updateBriefAnswers` ya no envíe `status` (commit del track). Si aplicás la migración sin el código, el flujo sigue funcionando igual (la base fuerza el valor correcto de todos modos); si desplegás el código sin la migración, el update del cliente perdería el `status` y quedaría siempre el último valor persistido hasta que apliques la migración.

## 2. Verificación manual (recomendada en un proyecto de prueba)

1. En **Auth → Users**, usá un usuario cliente con un proyecto + brief.
2. Desde una sesión del cliente, completá todas las respuestas obligatorias → al guardar, el brief debe quedar en `'completado'` (como antes).
3. Intentá el abuso que cerraba el hallazgo: desde el cliente, enviar `status='completado'` con respuestas incompletas no debe lograrlo (el trigger lo revierte a `'pendiente'`).

## 3. Verificación técnica (SQL, opcional)

```sql
-- Simular la request de un cliente con respuestas incompletas
select set_config('request.headers', '{"x-auth-uid":"<client-uid>"}', false);
-- (alternativamente set role authenticated y set request.jwt.claim.sub al client-uid)

update public.project_briefs
set answers = '{"nombre":"Mi marca"}'::jsonb, status = 'completado'
where project_id = '<project-id>';
-- → status NO debe quedar en 'completado'; la base lo fuerza a 'pendiente'

select project_id, status, answers from public.project_briefs where project_id = '<project-id>';
```

> Como `compute_brief_status` espeja reglas del frontend (`src/data/briefTemplates.ts`), si algún día se cambian los templates (campos requeridos, extras) hay que actualizar **también** el SQL de la migración. Está anotado en el encabezado del archivo.

## 4. Notas

- El **admin** sigue pudiendo tocar `status` libremente (`is_admin()` → `return new`), por si algún día hace falta un flujo de revisión manual.
- El cliente aún ve el preview de estado en su panel (`ClientBrief.tsx` usa `computeBriefStatus` para el UI); el valor autoritativo es el que devuelve la base tras cada guardado.