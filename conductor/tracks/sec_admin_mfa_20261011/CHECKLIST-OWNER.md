# Checklist del dueño — track `sec_admin_mfa_20261011`

> Track: **SEC-002** — exigir MFA (AAL2) para el acceso admin.
> Estado del código: **implementado y verificado (2026-10-11)**. Faltan los pasos del dashboard y la prueba manual.
> Regla: **fallar cerrado** — sin AAL2 no se accede a `/admin/*`.

---

## 1. Supabase Auth — habilitar MFA TOTP

- [ ] Dashboard → **Authentication → Providers** y **Authentication → Advanced Settings**: habilitar **Multi-factor Authentication (TOTP)**.
      - Opciones recomendadas: verificación del factor de TOTP en login (obligatorio), expiración de challenge razonable (default), tolerancia de clock drift (default).
- [ ] Confirmar que el tipo de factor **TOTP** está habilitado (no solo SMS).

## 2. Protección de contraseñas filtradas

- [ ] Dashboard → **Authentication → Advanced Settings**: activar **Leaked Password Protection** (integración HaveIBeenPwned). Con esto, GoTrue rechaza contraseñas conocidas como filtradas al registrarse/cambiar contraseña.

## 3. Rate-limit y política de contraseñas de GoTrue

- [ ] Dashboard → **Authentication → Rate Limits**: revisar/ajustar los límites de `auth` (global), `token refresh` y envío de OTP/magic link (valores por defecto aceptables; el objetivo ASVS es que un atacante no pueda brute-forcer el step-up).
- [ ] Política de contraseñas (si aplica a admin): longitud mínima y complejidad razonables.

## 4. Enrolamiento del admin y códigos de recuperación

- [ ] **Enrolar TOTP para el/los admin**: Dashboard → **Authentication → Users** → usuario admin → **Manage** → **Enroll TOTP** (se muestra el QR).
- [ ] **Guardar los códigos de recuperación** de cada admin en un gestor de contraseñas (mitigan lockout si se pierde el dispositivo).
- [ ] Alternativa de auto-enrolamiento: tras el despliegue, entrar a `/acceso-admin` → `/admin` → ser redirigido a `/admin/mfa` para escanear el QR (**solo si MFA está habilitado en el dashboard**; si no, el flujo muestra error controlado).

## 5. Verificación manual del flujo step-up

- [ ] Login admin (email+contraseña) → sesión AAL1 → al entrar a `/admin/*` **redirige a `/admin/mfa`**.
- [ ] **Sin factor enrolado**: se muestra QR + botón "Activar"; escanear con app TOTP (Authy/Google Authenticator), ingresar el código de 6 dígitos → queda autenticado AAL2 y entra a `/admin`.
- [ ] **Con factor enrolado**: se pide el código de verificación; código correcto → acceso; código incorrecto → mensaje de código inválido, sin acceso.
- [ ] **Cliente** (rol client) y sesión **no admin** siguen yendo a `/panel` (sin exigir MFA).
- [ ] Reintentar por `/admin` con sesión AAL1: siempre vuelve a `/admin/mfa` (no hay bypass por URL).

## 6. Verificación técnica del nivel de sesión

- [ ] (Opcional) En consola: tras verificar MFA, `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` debe devolver `currentLevel: 'aal2'`.