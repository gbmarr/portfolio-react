# Pasos 6-9: Despliegue, Pruebas E2E, Retención y Legal

> **Estado:** Migración 0018 aplicada. Sin backup (datos de prueba). Función `contact-notify` existente, secretos probablemente configurados, Turnstile existente. **Pasos 6-9 COMPLETADOS.**
> 
> **Objetivo:** Completar los pasos restantes del track `quote_request_20261024`.

---

## 6. Configurar Turnstile para acción `quote` y variables en Vercel

### 6.1 Verificar configuración de Turnstile
- [x] Ir a [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
- [x] Abrir el sitio/widget que ya usas para el formulario de contacto
- [x] Verificar que en **Hostnames** estén incluidos: `gabrielmarrero.com.ar`, `www.gabrielmarrero.com.ar`, `localhost`
- [x] **Reutilizado** - No fue necesario crear un nuevo sitio. El mismo sitio acepta diferentes `action` values.

### 6.2 Variables de entorno en Vercel
- [x] Verificar que exista `PUBLIC_TURNSTILE_SITE_KEY` en Vercel
- [x] Configurada correctamente

### 6.3 Verificación
- [x] Widget de Turnstile carga correctamente en formulario de presupuesto
- [x] Sin errores en consola relacionados con Turnstile

---

## 7. Desplegar función actualizada y pruebas E2E

### 7.1 Verificar secretos en Supabase
- [x] Secretos ya configurados, no fue necesario reconfigurarlos
- [x] `TURNSTILE_SECRET`/`TURNSTILE_SECRET_KEY`, `MAIL_PROVIDER_API_KEY` presentes

### 7.2 Desplegar función actualizada
- [x] Ejecutado `supabase functions deploy contact-notify --no-verify-jwt`
- [x] Función actualizada in-place con soporte `kind: 'contact' | 'quote'`

### 7.3 Pruebas E2E
- [x] Formulario de contacto existente sigue funcionando
- [x] Solicitud de presupuesto se envía correctamente (sin precios)
- [x] No se envía email al solicitante, solo al owner
- [x] Email al owner llega con detalles completos
- [x] Registro en `quote_requests` sin montos
- [x] Panel `/admin/presupuestos` funciona (listar, marcar contactado, cerrar/reabrir, mailto)
- [x] Validaciones funcionan (consentimiento, Turnstile, email estricta)
- [x] Rate limiting cliente y servidor funcionando
- [x] Sin errores en consola ni en logs de Supabase Functions

---

## 8. Revisar retención y política de borrado

### 8.1 Implementación
- [x] pg_cron habilitado en Supabase
- [x] Función para anonimizar leads cerrados > 12 meses creada
- [x] Job programado mensualmente (`cron.schedule`)
- [x] Anonimización: `name = 'ANON'`, `email = 'anon@deleted.local'`, `notes = NULL`
- [x] Solo afecta registros con `status = 'closed'` y mayor a 12 meses
- [x] Rate limit tables con cleanup existente

---

## 9. Revisión legal y cierre

### 9.1 Revisión legal
- [x] Política de Privacidad (`/privacidad`) actualizada y revisada
- [x] Términos y Condiciones (`/terminos`) revisados (presupuesto no vinculante, sin precios públicos)
- [x] Consentimiento obligatorio y versionado (`2026-10-24`) en ambos formularios
- [x] Derechos ARCO/AAIP documentados
- [x] Base legal (consentimiento) confirmada
- [x] **Validación de email reforzada** - rechaza TLDs numéricos (`madojna@123a.adad`)

### 9.2 Verificación final
- [x] Tests: 616/616 verdes
- [x] TypeScript sin errores
- [x] Lint sin errores
- [x] Build exitoso
- [x] Coverage: 93.28% statements / 87.52% branches / 92.36% functions / 95.18% lines
- [x] Sin strings de precios en bundle de producción
- [x] Logs de función normales
- [x] Panel admin funcional

### 9.3 Estado
- [x] **Pasos 6-9 COMPLETADOS**
- [ ] Actualizar plan/metadata marcando T7.5 como hecho
- [ ] Commit final de track

---

**Notas:** Sin backup necesario (datos de prueba). Secretos/función/Turnstile ya existentes reutilizados. Respuesta manual al solicitante (sin email automático). Anonimización automática con pg_cron implementada.
