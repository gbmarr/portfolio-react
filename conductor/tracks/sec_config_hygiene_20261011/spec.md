# Spec — Higiene de configuración de seguridad

> **Track ID:** `sec_config_hygiene_20261011`
> **Fuente:** Hallazgo **SEC-009 (Info)** de la auditoría de seguridad run-2.
> **Estado:** 🔜 Pendiente.

---

## 1. Contexto y objetivo

Hallazgos menores de configuración:

1. **HSTS:** production sirve `Strict-Transport-Security: max-age=63072000` (provisto por Vercel) pero **no está declarado** en `vercel.json`/`netlify.toml` → no reproducible ni versionado.
2. **CSP/cabeceras:** `style-src 'unsafe-inline'` (por estilos inline de React) y `connect-src https://*.supabase.co` (comodín amplio).
3. **Docs desactualizadas:** referencias a Web3Forms en `conductor/` (p. ej. `conductor/servicios.md:67,284`) que ya no aplica.
4. **`envPrefix`** amplio (`DATABASE_`, `ARS_`, `TURNSTILE_`): cualquier var con esos prefijos se inlina.

**Objetivo:** alinear la configuración versionada con la real y reducir ambigüedad.

## 2. Functional Requirements

- **FR1 —** Declarar HSTS explícitamente en la config de deploy.
- **FR2 —** (Opcional) acotar `connect-src` al ref exacto de Supabase.
- **FR3 —** Actualizar/eliminar la documentación de Web3Forms.
- **FR4 —** Revisar `envPrefix` y documentar por qué cada prefijo es público.

## 3. Non-Functional Requirements

- **NFR1 —** Sin romper el deploy ni la app.
- **NFR2 —** Suite verde (incluye el test de headers existente).

## 4. Acceptance Criteria

- [ ] `vercel.json`/`netlify.toml` declaran HSTS.
- [ ] Docs sin referencias a Web3Forms.
- [ ] `envPrefix` justificado o acotado.
- [ ] Test de headers verde tras los cambios.

## 5. Out of Scope

- Cambios de arquitectura o flujos de auth.
