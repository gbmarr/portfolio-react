# CHECKLIST-OWNER — SEC-003 (rate-limit de contacto endurecido)

> Track: `sec_contact_rate_limit_20261011` · Issue: #9 · Migración: `0010_contact_rate_limit_hardened.sql` · Edge Function: `contact-notify`

Perfil: **owner** (acceso al dashboard de Supabase y permisos de deploy). Solo vos podés aplicar estos pasos; luego el track queda cerrado.

---

## 1. Aplicar la migración 0010 (obligatorio para que el control exista)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0010_contact_rate_limit_hardened.sql`.
3. **Antes de ejecutar**, verificá que la única vía de insert sigue siendo la Edge Function (migración 0009 aplicada). Si no aplicaste `0009`, aplicala primero.
4. Ejecutá. Debería terminar sin errores: crea `contact_global_burst`, recrea `throttle_contact_messages()` (fail-closed) y el trigger `contact_messages_throttle`.

**Qué hace:** lee la IP real desde `x-client-ip` (la envía la Edge Function) con fallback a `x-forwarded-for`, mantiene 1 consulta/min por-IP (semántica 0008), añade un **límite global anti-flood de 120 consultas/min** y **falla cerrado** si no hay IP (la request es anómala).

## 2. Desplegar la Edge Function actualizada

La Edge Function cambió para calcular la IP con `clientIp()` (`cf-connecting-ip` → `x-real-ip` → `x-forwarded-for`[0]) y propagarla a PostgREST con `setHeader("x-client-ip", ip)`.

```bash
supabase functions deploy contact-notify --no-verify-jwt
```

(Desde la raíz del repo, con la sesión CLI ya vinculada. Los secretos `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY` ya están configurados en el dashboard.)

## 3. Prueba funcional rápida (manual)

1. En producción, enviá el formulario de contacto una vez → debe responder `{ok:true}` y llegar el email.
2. Enviá una segunda vez **dentro del mismo minuto** → la Edge Function debe responder **HTTP 429** `{"ok":false,"error":"rate-limited"}`.
3. Esperá un minuto y volvé a enviar → OK de nuevo.

## 4. Verificación técnica (SQL, opcional pero recomendado)

Pegá esto en SQL Editor para confirmar el estado del control:

```sql
-- Estado de la tabla de rate-limit por-IP
select * from public.contact_rate_limits order by window_start desc limit 5;

-- Contador global (debe existir 1 fila; hits = consultas del minuto actual)
select * from public.contact_global_burst;
```

**Simular el fail-closed (comportamiento ante IP ausente):** desde SQL Editor, un insert directo sin headers debe ser rechazado:

```sql
insert into public.contact_messages (name, email, message)
values ('Test', 'test-sec003@example.com', 'Mensaje de prueba de 10 caracteres');
-- → ERROR: Demasiados envíos. Esperá un minuto e intentá de nuevo.
-- (esperado: fail-closed; el trigger no ve `x-client-ip` en sesión local)
```

**Simular una request real** (equivalente a lo que hace PostgREST):

```sql
select set_config('request.headers', '{"x-client-ip":"203.0.113.7"}', false);
insert into public.contact_messages (name, email, message)
values ('Test', 'test-sec003@example.com', 'Mensaje de prueba de 10 caracteres');
-- → OK (primer insert del minuto)
insert into public.contact_messages (name, email, message)
values ('Test', 'test-sec003@example.com', 'Mensaje de prueba de 10 caracteres');
-- → ERROR: Demasiados envíos... (dentro del mismo minuto)
```

> ⚠️ **Nota operativa:** el trigger es fail-closed también para inserts directos tuyos desde SQL Editor/backfill scripts. Si alguna vez necesitás insertar a mano, usá `select set_config('request.headers', '{"x-client-ip":"..."}', false);` antes, o desactivá temporalmente el trigger: `drop trigger if exists contact_messages_throttle on public.contact_messages;` (y volvé a crearlo con el SQL de la migración).

## 5. Trade-off documentado (decisión D1)

- **NAT compartido:** usuarios legítimos detrás de una misma IP comparten el límite por-IP (1/min). El límite **global de 120/min** es una red de seguridad anti-flood multi-IP y está muy por encima del uso real del formulario, así que no debería afectar a usuarios reales.
- **Turnstile sigue siendo el control autoritativo** del flujo real (server-side en la Edge Function); el rate-limit de PostgreSQL mitiga el abuso masivo/forwarding, no lo reemplaza.