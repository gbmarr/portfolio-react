# CHECKLIST-OWNER — SEC-005/006/007 (hardening envío de email de contacto)

> Track: `sec_contact_email_hardening_20261011` · Migración: `0012_contact_content_hardening.sql` · Edge Function: `contact-notify`

Perfil: **owner** (acceso al dashboard de Supabase y permisos de deploy). Solo vos podés aplicar estos pasos; luego el track queda cerrado.

---

## 1. Aplicar la migración 0012 (obligatorio para la defensa en profundidad)

1. Abrí Supabase Dashboard → **SQL Editor** → *New query*.
2. Pegá el contenido de `supabase/migrations/0012_contact_content_hardening.sql`.
3. Ejecutá. Debe terminar sin errores: agrega (idempotente) las constraints `contact_messages_name_no_control` y `contact_messages_email_no_control`.

**Qué hace:** rechaza a nivel de esquema cualquier `name`/`email` con caracteres de control (CR/LF/NUL), la vía de **inyección de headers de email** (subject/reply_to). `message` queda exento (admite saltos de línea legítimos).

> ⚠️ Si la tabla tuviera filas con caracteres de control (no debería), el `add constraint` fallará. Antes de aplicar, podés localizarlas con:
> ```sql
> select id, name, email from public.contact_messages
> where name ~ '[[:cntrl:]]' or email ~ '[[:cntrl:]]';
> ```

## 2. Desplegar la Edge Function actualizada

La función cambió para:
- validar **server-side** `name`/`email` contra caracteres de control y rechazar dominios desechables (SEC-005/SEC-007),
- enviar `reply_to` **solo** cuando el valor es un email válido (SEC-005),
- verificar en Turnstile `success` + `action: 'contact'` + `hostname` permitido (SEC-006).

```bash
supabase functions deploy contact-notify --no-verify-jwt
```

(Desde la raíz del repo, con la sesión CLI ya vinculada. Los secretos `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET`, `MAIL_PROVIDER_API_KEY` ya están configurados en el dashboard.)

> **Orden sugerido:** desplegar la función **y** aplicar la migración juntos (mismo ventana). No hay reintento automático en la función ante un 400, así que el usuario solo vería el error del formulario; el mensaje no se pierde ni se duplica.

## 3. Prueba funcional rápida (manual)

1. En producción, enviá el formulario de contacto con un email normal → `{ok:true}` y llega el email a `hola@gabrielmarrero.com.ar`.
2. Enviá con **WhatsApp/teléfono** en el campo → `{ok:true}` y llega el email (sin `reply_to`; esperado).
3. Enviá con un email desechable (`spam@mailinator.com`) → la función debe responder `400` `{"ok":false,"error":"invalid-payload","reason":"email"}`.
4. Esperá un minuto entre envío normal y pruebas de abajo para no topar el rate-limit (1/min por IP).

## 4. Prueba del fix de inyección de headers (POST directo, SEC-005)

Desde tu máquina (no el browser; esto simula el bypass del cliente):

```bash
# name con CRLF (Bcc) → debe responder 400 invalid-payload reason "name"
curl -i -X POST "https://<ref>.functions.supabase.co/contact-notify" \
  -H "Content-Type: application/json" \
  -H "Origin: https://gabrielmarrero.com.ar" \
  -d '{"name":"Ana\r\nBcc: attacker@example.com","email":"ana@example.com","message":"Mensaje de prueba valido","turnstileToken":"x"}'

# email con CRLF → 400 invalid-payload reason "email"
curl -i -X POST "https://<ref>.functions.supabase.co/contact-notify" \
  -H "Content-Type: application/json" \
  -H "Origin: https://gabrielmarrero.com.ar" \
  -d '{"name":"Ana","email":"ana@example.com\nbcc:x@y.com","message":"Mensaje de prueba valido","turnstileToken":"x"}'
```

> El token de Turnstile será inválido en curl (no pasa el widget), pero la validación de payload ocurre **antes** del siteverify, así que el `400 invalid-payload` es la prueba del fix. En un atacante real, aún con token válido, el CRLF sería rechazado por esta capa.

## 5. Verificación técnica (SQL, opcional pero recomendado)

```sql
-- Estado de las constraints (deben existir ambas)
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.contact_messages'::regclass
  and conname like 'contact_messages_%_no_control';

-- Un insert con CRLF debe ser rechazado por el esquema (falla la constraint):
insert into public.contact_messages (name, email, message)
values ('Ana' || chr(10) || 'Bcc: x@y.com', 'ana@example.com', 'Mensaje de prueba valido');
-- → ERROR: new row for relation "contact_messages" violates check constraint ...
```

## 6. Verificación de Turnstile (SEC-006)

El widget ahora envía `action: 'contact'`. Después del deploy, en el navegador:
1. Recargá el sitio con caché limpia (el JS viejo podría renderizar un widget sin `action` → token rechazado con `400 turnstile`).
2. Enviá el formulario → debe funcionar normalmente.
3. Abrí DevTools → Network → en la respuesta de `contact-notify` no debería haber forma de ver `hostname`; el control es server-side. La evidencia indirecta: el sitio funciona (hostname `gabrielmarrero.com.ar` permitido) y `http://localhost:5173` en dev también.

## 7. Pendientes tras el ciclo

- [ ] Migración `0012` aplicada en SQL Editor
- [ ] `supabase functions deploy contact-notify --no-verify-jwt` ejecutado
- [ ] Pruebas de los pasos 3–4 en producción
- [ ] Marcar el track como `completed` en `metadata.json` y actualizar `tracks.md`
- [ ] Commit opcional de esta checklist completada