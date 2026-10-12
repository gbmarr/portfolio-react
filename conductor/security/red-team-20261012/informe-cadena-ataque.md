# Informe de cadena de ataque — Bypass total del panel admin con solo la contraseña

**Fecha:** 2026-10-12 · **Modo:** Paper red team (solo-lectura de código, sin pruebas activas) · **Entorno analizado:** repo `C:\dev\portfolio` (prod `gabrielmarrero.com.ar`) · **Severidad final:** **Alta**

## Resumen ejecutivo
La MFA del panel admin existe **solo en el navegador**. La API de Supabase (PostgREST) autoriza las operaciones de admin mirando únicamente `profiles.role='admin'` en RLS; **ninguna política verifica el nivel de autenticación (`aal`)**. Por lo tanto, quien obtenga la contraseña del admin (phishing, reuso, filtración) puede autenticarse por API, obtener un token **AAL1** y leer/escribir **toda** la información de clientes directamente contra la base, sin pasar por la pantalla de TOTP. El segundo factor no aporta protección real ante el escenario que MFA busca mitigar. Peor aún: no existe trazabilidad de acciones admin, por lo que el abuso sería **invisible**.

## Resumen de cadenas de la sesión
| ID | Cadena | Severidad final | Precondición | Complejidad | Detectabilidad |
|---|---|---|---|---|---|
| RT-01 | MFA admin no aplicada en RLS → bypass total con solo contraseña | **Alta** | Contraseña o token admin | Baja | Baja |
| RT-02 | Self-signup abierto por API (`shouldCreateUser:true` público) | Media | Controlar un email que figure como `client_email` | Baja-Media | Media |
| RT-03 | `milestone_approvals` UPDATE sin re-validar pertenencia del proyecto | Baja | UUID de stage ajeno (no enumerable) | Media | Media |
| RT-04 | Ausencia de audit log de acciones admin | Media (detección) | — | — | Nula (gap) |
| RT-05 | Token de sesión en `localStorage` (robo vía XSS) | Info/Baja | XSS en el origen | Media | Media |

> Calificación por **impacto final de la cadena**, no por el eslabón aislado. Detalle individual en [`informe-hallazgos.md`](./informe-hallazgos.md).

---

## Cadena RT-01 — MFA client-side bypasseable (Crítica de impacto / Alta del control)

### Objetivo (corona) y perfil de atacante
- **Objetivo comprometido:** panel admin `/admin/*` y datos de clientes (PII) en Supabase.
- **Perfil asumido:** atacante externo con la contraseña del admin (phishing, reuso, credential stuffing, leak) — exactamente el escenario que MFA debe contener.
- **Precondiciones:** credencial válida del admin (o un access token AAL1 robado). No requiere TOTP, ni acceso al dispositivo del admin, ni 0-day.

### Cadena de ataque

| Paso | Acción | Vulnerabilidad / debilidad explotada | Evidencia |
|---|---|---|---|
| 1 | Obtener email+contraseña del admin | Fuera de alcance del código (factores humanos) | — |
| 2 | `POST /auth/v1/token?grant_type=password` con la publishable key | Auth GoTrue permite password grant | `src/lib/auth.tsx` (`signInWithPassword`) |
| 3 | Recibir access token **AAL1** (`role=authenticated`) | `getAuthenticatorAssuranceLevel` es client-side; el token AAL1 es plenamente usable por API | `src/lib/auth.tsx:92-117` |
| 4 | `GET /rest/v1/projects`, `/profiles`, `/contact_messages` con `Authorization: Bearer <AAL1>` | RLS de admin usa `is_admin()` = solo `role='admin'`; **no mira `aal`** | `supabase/migrations/0001_init.sql:54-65` y todas las policies admin |
| 5 | Leer/editar/borrar datos de clientes | Policies de admin conceden `select/insert/update/delete` | `0001_init.sql` (profiles/projects/project_stages/contact_messages) |
| 6 | Ningún evento distingue esto de un admin legítimo | No hay `audit_log` | — (gap RT-04) |

```
Precondición: contraseña admin
  → [1] password grant            (AAL1 JWT, sin TOTP)
  → [2] PostgREST directo          (RLS: is_admin()=true, sin chequeo de aal)
  → [3] PII de clientes + escritura
Impacto: confidencialidad + integridad totales, sin alerta
```

### Evidencia (mínima necesaria — a ejecutar en staging con autorización)
```http
# Paso 2 (sin segundo factor)
POST https://<ref>.supabase.co/auth/v1/token?grant_type=password
apikey: <publishable>
Content-Type: application/json
{ "email": "admin-test@example.test", "password": "<own-test-pass>" }
# → 200 { access_token: "<JWT con \"aal\":\"aal1\">" }

# Paso 4 (saltea la UI de /admin/mfa)
GET https://<ref>.supabase.co/rest/v1/projects?select=client_name,client_email
Authorization: Bearer <AAL1_token>
apikey: <publishable>
# Estado vulnerable: 200 con filas (RLS autoriza). Esperado tras el fix: 0 filas / 403.
```
> No se ejecutó ninguna prueba activa. La reproducibilidad se deriva de la lectura de `is_admin()` y de las policies.

### Impacto de negocio
- **CIA afectadas:** Confidencialidad **e** Integridad (lectura y escritura), sin componente de disponibilidad explícito.
- **Datos/funciones comprometidas:** nombres, emails, teléfonos y proyectos de clientes; briefs; mensajes de contacto; capacidad de crear/borrar clientes y proyectos.
- **Blast radius:** al ser admin, el atacante alcanza también `contact_messages` (PII de terceros que escribieron por el formulario) y podría sembrar datos falsos. No escala a la infraestructura (Supabase/Resend) porque las claves de servicio no están en el repo ni en el cliente.
- **Impacto estimado:** incumplimiento de confidencialidad de PII de clientes (Ley 25.326): riesgo reputacional y legal.

### Choke point (dónde cortar la cadena)
El eslabón más barato es **una sola función SQL**: hacer que la autorización de admin dependa del claim `aal='aal2'`. Corrige RT-01 y, de paso, neutraliza el valor de un token AAL1 robado para *cualquier* vector futuro.

### Remediación
| Paso | Corrección propuesta | Referencia | Prioridad |
|---|---|---|---|
| 4 | Helper `is_admin_aal2()` que exija `is_admin()` **y** `(auth.jwt()->>'aal')='aal2'`; usarlo en las policies de admin (choke point único) | `app-security/references/03,04` | Inmediata |
| 2-3 | (Defensa en profundidad) revisar settings de GoTrue: rate-limit de sign-in, Leaked Password Protection | `app-security/references/03` | Media |
| 6 | Crear `audit_log` de acciones admin | ver RT-04 | Media |

### Detección
| Paso | ¿Se detectó? | Evento/log esperado | Regla propuesta | Dueño |
|---|---|---|---|---|
| 2 | No | `auth.audit_log_entries` (login password) | Alerta si login password de un admin ocurre y en los siguientes N min hay requests REST admin con `aal=aal1` | owner |
| 4 | No | PostgREST logs + claim de JWT | Alerta si un actor admin hace REST sin `aal2` | owner |
| 6 | No | — | Sin `audit_log` no hay señal; ver RT-04 | owner |

### Verificación y retest
- **Test de regresión propuesto:** con un admin de prueba, (a) token **AAL1** → `select` a `projects`/`profiles`/`contact_messages` debe devolver **0 filas / 403**; (b) tras verificar TOTP (AAL2) → `select` admin vuelve a funcionar. Ejecutable como test SQL/pgTAP o script de integración contra staging.
- **Fecha de retest:** pendiente.
- **Estado tras retest:** Pendiente.

### Riesgo residual
Si se aplica el chequeo `aal` en RLS y un admin queda atascado en AAL1 (p. ej. pierde el dispositivo TOTP), **queda fuera del panel hasta usar códigos de recuperación**. Mitigar con códigos de recuperación guardados (ya previsto en SEC-002) y documentar el procedimiento.

---

## Cadena RT-02 — Self-signup abierto por API (Media)

### Objetivo y perfil
- **Corona:** cuentas de cliente y, en el escenario "email colgado", un proyecto ajeno.
- **Perfil:** anónimo en internet.
- **Precondición:** controlar un email que ya figure como `projects.client_email` (p. ej. el admin cargó el proyecto antes de que el cliente cree la cuenta, o un typo del admin).

### Cadena
| Paso | Acción | Debilidad | Evidencia |
|---|---|---|---|
| 1 | `POST /auth/v1/otp` con `{ create_user: true }` y un email arbitrario | `shouldCreateUser:false` es **solo UI**; el endpoint acepta creación directa | `src/lib/auth.tsx:121-146` |
| 2 | Recibir el magic link del email (si es propio/controlable) | GoTrue crea la cuenta si no existe | — |
| 3 | Iniciar sesión → rol `client` | — | — |
| 4 | Ver proyectos donde `lower(profiles.email)=projects.client_email` | Tenancy por email, sin FK | `0001_init.sql` (projects select) |

```
Precondición: email controlable == client_email ya cargado
  → otp?create_user=true → cuenta → sesión client → proyecto "colgado"
Impacto: lectura/edición del proyecto/brief de ese email (acotado)
```

### Remediación
- Si el modelo es **invite-only**: activar **`disable_signup`** en Supabase Auth (dashboard) → el endpoint deja de crear usuarios y solo el flujo de invitación (admin) da de alta clientes. **Verificar este setting: no es visible desde el repo (no hay `supabase/config.toml`).**
- Validar/normalizar `client_email` al crear proyectos (evitar typos que se conviertan en tenancy de un tercero).

### Detección
- Alerta por **creación de usuario** en Auth que no provenga del flujo de invitación del admin.

### Estado
Requiere confirmación del owner sobre el modelo (¿invite-only?) antes de decidir `disable_signup`.

---

## Cadena RT-03 — RLS de `milestone_approvals` en UPDATE (Baja)

### Cadena
La policy de **SELECT/INSERT** de `milestone_approvals` re-verifica la pertenencia del proyecto, pero la de **UPDATE** solo exige `auth.uid()=client_id` en `using`/`with check`. El trigger `check_approval_stage` valida que el *stage* pertenezca al *project*, pero **no** que el *project* sea del cliente (`0001_init.sql:302-321, 341-345`). Un cliente puede, con el UUID de un stage ajeno (no enumerable por RLS), apuntar su fila de aprobación a un proyecto que no es suyo → impacto de integridad acotado.

### Remediación
Replicar el `exists(...)` de ownership del INSERT en el `with check` del UPDATE.

### Detección
Updates de `milestone_approvals` donde `project_id` no pertenece al `auth.uid()`.

---

## Cadena RT-04 — Sin audit log de acciones admin (Media, detección)

No existe tabla `audit_log`. Toda acción admin (crear/borrar clientes, leer mensajes) es indistinguible de la de un atacante con token admin. No es explotable por sí sola, pero **anula la capacidad de detectar RT-01**. Remediar con un `audit_log` (actor, acción, entidad, timestamp, IP) alimentado por trigger en tablas sensibles. Detección: consulta al log + alertas por patrones anómalos.

---

## Cadena RT-05 — Token de sesión en `localStorage` (Info/Baja)

El JWT se persiste en `localStorage` (`storageKey: 'portfolio-auth'`), por lo que cualquier XSS en el origen robacceso a la sesión admin. Mitigado por una CSP sin `unsafe-inline` en `script-src`, `object-src 'none'` y `frame-ancestors 'none'`. Ya analizado en SEC-008 (ADR-0001: cookie httpOnly inviable en SPA estática). Se mantiene como **riesgo aceptado**; sin acción nueva, pero vigilar `style-src 'unsafe-inline'` no introducir `dangerouslySetInnerHTML`.

---

## Positivos verificados (no perderlos en las correcciones)
RLS por email consistente con `is_admin()` security-definer; tenancy resincronizada ante cambio de email (`0006`); INSERT anónimo de contacto cerrado (`0009`); rate-limit de contacto fail-closed + global (`0010`); validación anti-CRLF server-side y en esquema (`0005/0012`); `status` del brief derivado en DB (`0011`); PKCE (`SEC-008`); `envPrefix=['PUBLIC_']`; backups y `.env*` fuera de git (verificado con `git ls-files`).
