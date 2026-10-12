# CHECKLIST-OWNER — RT-04 (audit log de acciones admin)

> Track: `sec_admin_audit_log_20261012` · Issue: #26 · Migración: `0014_audit_log.sql`

Perfil: **owner** (acceso al dashboard de Supabase). Aporta la **capacidad de detección** que cierra el ciclo del red team ("¿lo habríamos visto?"): un abuso con token admin pasa a dejar rastro propio.

---

## 1. Aplicar la migración 0014 (obligatorio)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0014_audit_log.sql`.
3. Ejecutá. Debería terminar sin errores: crea la tabla `audit_log`, la función `audit_row()`, seis triggers, la policy de lectura y `prune_audit_log()`.

> ⚠️ **Orden:** aplicar `0013` (RT-01) **antes** que `0014`, para que la lectura de `audit_log` exija además AAL2. Aplicar primero `0014` no rompe nada, solo deja la lectura solo-admin sin AAL2 hasta que llegue `0013`.

## 2. Verificación manual (en un proyecto de prueba)

1. Creá y borrá un proyecto como admin y confirmá el rastro:
   ```sql
   select action, entity, entity_id, actor_email, metadata, created_at
     from public.audit_log
    order by created_at desc
    limit 10;
   ```
   → Debe aparecer `insert` y luego `delete` sobre `projects`.
2. Editá un proyecto (p. ej. el `status`) y verificá que en UPDATE solo figura el nombre de la columna:
   ```sql
   select metadata from public.audit_log
    where entity = 'projects' and action = 'update'
    order by created_at desc limit 1;   -- → {"changed": ["status", ...]}
   ```
3. **Un cliente NO debe poder leer ni escribir `audit_log`.** Con el bearer de un cliente (y con el anon key):
   ```http
   GET https://<ref>.supabase.co/rest/v1/audit_log?select=*
   Authorization: Bearer <token cliente>
   apikey: <publishable>
   ```
   → Debe devolver **0 filas / sin permiso**. Un `POST`/`PATCH`/`DELETE` debe ser rechazado.

## 3. Consultas de detección (FR4)

Guardá estas consultas; son la parte "¿lo habríamos visto?".

```sql
-- A) Ráfaga de borrados (posible borrado masivo / destrucción de evidencia).
select actor_email, count(*)
  from public.audit_log
 where action = 'delete' and created_at > now() - interval '5 minutes'
 group by actor_email
having count(*) >= 5
 order by count(*) desc;

-- B) Cambio del email del cliente de un proyecto (posible robo de tenancy).
select created_at, actor_email, entity_id, metadata
  from public.audit_log
 where entity = 'projects'
   and action = 'update'
   and metadata -> 'changed' ? 'client_email'
 order by created_at desc;

-- C) Cambio de rol en profiles (escalada de privilegios).
select created_at, actor_email, entity_id, metadata
  from public.audit_log
 where entity = 'profiles'
   and action = 'update'
   and metadata -> 'changed' ? 'role'
 order by created_at desc;

-- D) Escritura de admin SIN evidencia de AAL2 (tras aplicar RT-01).
--    Heurística: actividad admin reciente mientras el actor tiene aal1/ausente.
--    (El claim aal no se persiste; cruzar con Auth Logs de Supabase por hora/IP.)
select date_trunc('minute', created_at) as minute, actor_email, ip, count(*)
  from public.audit_log
 where actor_email is not null and created_at > now() - interval '1 hour'
 group by 1, 2, 3
 order by 1 desc;

-- E) Autopsia de una entidad puntual (timeline de cambios).
select created_at, action, actor_email, metadata
  from public.audit_log
 where entity = 'projects' and entity_id = '<uuid>'
 order by created_at;
```

> Complemento recomendado: activar **Log Drains** de Supabase/Vercel hacia un SIEM para alertas en tiempo real (fuera de alcance de este track). Mientras tanto, programá las consultas A–D por cron o revisalas ante un incidente.

## 4. Retención (NFR3)

- Política sugerida: **conservar 90 días**.
- Limpieza manual o programada:
  ```sql
  select public.prune_audit_log(90);  -- borra lo anterior a 90 días; devuelve el nº borrado
  ```
- Opcional (si tu plan lo permite) con `pg_cron`:
  ```sql
  select cron.schedule('prune-audit-log', '0 4 * * *', $$select public.prune_audit_log(90)$$);
  ```

## 5. Notas

- La tabla es **append-only** para la app: sin policy de INSERT/UPDATE/DELETE y con `REVOKE` de esos privilegios a `anon`/`authenticated`. Solo los triggers (SECURITY DEFINER, owner) escriben.
- `metadata` a propósito **no** guarda valores en UPDATE (solo nombres de columnas) para no duplicar PII.
- Los INSERT anónimos de contacto (Edge Function con `service_role`) quedan registrados sin actor (`actor_id`/`actor_email` nulos): útil para volumen, no para atribución.
- Si más adelante se agregan tablas sensibles, sumá un trigger: `create trigger <t>_audit after insert or update or delete on public.<t> for each row execute function public.audit_row();`
