# Spec — Cerrar el self-signup por API y validar `client_email`

> **Track ID:** `sec_signup_lockdown_20261012`
> **Fuente:** Hallazgo **RT-02 (Media)** del red team 2026-10-12.
> **Estado:** 🚧 Pendiente de implementación.

---

## 1. Contexto y objetivo

El sitio diferencia **login** (sin crear cuenta, `shouldCreateUser:false`, `src/lib/auth.tsx:121-133`) de **invitación del admin** (`shouldCreateUser:true`, `:135-146`). Pero esa distinción es **solo de UI**: el endpoint de GoTrue `/auth/v1/otp` acepta `create_user=true` para cualquiera con la publishable key. Si no está deshabilitado el signup en el proyecto, un anónimo puede crear cuentas.

Escenario de impacto: la tenancy de cliente se resuelve por email (`projects.client_email`, sin FK). Si el admin cargó un proyecto con el email de un tercero (o cometió un typo), el atacante que controle ese email crea su cuenta y accede a ese proyecto.

**Objetivo:** que la creación de cuentas sea **exclusiva del flujo de invitación** y que `client_email` se valide/normalice al dar de alta proyectos.

## 2. Functional Requirements

- **FR1 —** Deshabilitar el signup público de GoTrue (`disable_signup`) si el modelo es *invite-only* (acción de dashboard; documentar y verificar).
- **FR2 —** Validar `client_email` (formato de email, minúsculas) en el alta/edición de proyectos en el cliente.
- **FR3 —** (Defensa en profundidad) Normalizar/validar también a nivel base si hace falta (la CHECK actual exige `lower()` y longitud; evaluar validez estructural).

## 3. Non-Functional Requirements

- **NFR1 —** No romper el flujo de invitación del admin (`inviteByMagicLink`).
- **NFR2 —** Mensaje de error claro en el alta de proyecto si el email es inválido.
- **NFR3 —** Suite verde; cobertura no baja.

## 4. Acceptance Criteria

- [ ] `POST /auth/v1/otp` con `create_user=true` para un email nuevo **no** crea usuario (403) tras `disable_signup`.
- [ ] El flujo de invitación del admin sigue funcionando.
- [ ] El alta/edición de proyecto rechaza emails inválidos y normaliza a minúsculas.
- [ ] Suite verde; `typecheck`/`lint` ok.

## 5. Out of Scope

- Verificación de entregabilidad (MX) del email del cliente.
- Migración de datos existentes (la CHECK de `lower()` ya está aplicada).
