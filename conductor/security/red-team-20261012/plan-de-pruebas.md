# Plan de pruebas — Red Team / Pentest interno (portfolio)

**Sistema:** Portfolio + gestión de clientes (`gabrielmarrero.com.ar`) · **Fecha:** 2026-10-12 · **Responsable:** owner (gbmarr) · **Aprobado por:** owner del sistema

## 1. Autorización y reglas de contención
- **Autorización:** sistema propio; este ejercicio se autorizó como **paper red team (solo-lectura de código)**, sin pruebas activas.
- **Alcance incluido:** repo `C:\dev\portfolio` (código, migraciones, config de deploy/CI), Supabase del proyecto `jntueibgkfwptigpncmh`.
- **Alcance excluido:** producción en vivo, datos reales de clientes, Supabase/Resend como proveedores de terceros, acciones destructivas.
- **Entorno:** para ejecución futura, **staging aislado con datos sintéticos**.
- **Ventana de ejecución:** no aplica (paper). Para ejecución: acordar ventana.
- **Reglas:** sin DoS real · sin alterar/destruir datos reales · sin exfiltrar datos reales (usar cuentas/registros propios) · sin ingeniería social salvo alcance explícito.
- **Contacto de emergencia:** owner.
- **Cuentas de prueba:** admin de prueba (con TOTP propio), cliente de prueba en su propio tenant; credenciales sintéticas, nunca reales.

## 2. Objetivos (coronas)
| # | Objetivo de negocio a proteger | Peor impacto |
|---|---|---|
| 1 | PII de clientes y proyectos (panel admin) | Exfiltración/borrado masivo |
| 2 | Integridad de aprobaciones de etapas | Manipulación de estado de proyecto |
| 3 | Cuentas de cliente y su tenancy por email | Acceso a proyecto ajeno |
| 4 | Reputación de envío (Resend) y del dominio | Spam desde `hola@` |

## 3. Perfiles de atacante a simular
- [x] Anónimo en internet
- [x] Usuario registrado malicioso (cliente)
- [x] Usuario de otro tenant
- [x] Rol bajo escalando a admin
- [ ] Insider/soporte
- [ ] Proveedor/dependencia comprometida
- [ ] Atacante con foothold en CI/CD
- [x] Bot/fraudster económico (formulario, abuso de cupos/emails)

## 4. Superficie en alcance
| Activo | Tipo | Exposición | Notas |
|---|---|---|---|
| `/admin/*`, `/panel/*`, `/login`, `/acceso-admin` | Web (SPA) | Pública (noindex) | Guards client-side |
| PostgREST `/rest/v1/*` | API | Pública con publishable key | Barrera = RLS |
| GoTrue `/auth/v1/*` | API | Pública con publishable key | password/otp/mfa |
| Edge Function `contact-notify` | API (Deno) | Pública (`--no-verify-jwt`) | Turnstile + rate-limit |
| Migraciones `0001..0012` | DB/SQL | Interna | RLS/policies |
| Repo / CI (GitHub Actions) | CI-CD | Interna | CodeQL, Dependabot, SBOM |

## 5. Plan por fase
| Fase | Dominio | Técnicas a probar | Referencia | Responsable | Estado |
|---|---|---|---|---|---|
| Reconocimiento | Superficie, secretos, versiones | `git ls-files`, `.env.example`, JS bundles | `references/01` | owner | Hecho (paper) |
| Identidad | Login, MFA, recuperación | Password grant directo vs. AAL2 en RLS; OTP `create_user` | `references/03` | owner | Pendiente |
| Autorización | IDOR/BOLA, BFLA, mass assignment, multi-tenant | REST directo con token AAL1; update de approvals a project ajeno | `references/03` | owner | Pendiente |
| Lógica de negocio | Estados, deriva de `status`, aprobaciones | Manipular `project_briefs.status` / `milestone_approvals` | `references/04` | owner | Pendiente |
| Entradas/cliente | Inyección, XSS, CSRF, SSRF, uploads | XSS → robo de `localStorage`; CSP | `../app-security/references/05-07` | owner | Pendiente |
| APIs | Rate limit, webhooks | Turnstile replay; 429 del form; límites de GoTrue | `../app-security/references/08` | owner | Pendiente |
| Cloud/CI-CD | IAM, secretos, pipelines | Secrets fuera del repo (verificado); workflow perms | `references/05` | owner | Hecho (paper) |
| IA/Agentes | Prompt injection, herramientas | No aplica (sin LLM en producto) | `references/06` | owner | N/A |
| Disponibilidad | Límites, costos (sin DoS real) | Cuota Resend, límite global 120/min | `../app-security/references/17` | owner | Pendiente |
| Detección | Purple team por técnica ejecutada | ¿`audit_log`? ¿alerta por AAL1 admin? | `references/07` | owner | Gap identificado (RT-04) |

## 6. Cadenas priorizadas a intentar
| # | Corona objetivo | Hipótesis de cadena | Prioridad |
|---|---|---|---|
| RT-01 | PII admin | Password grant → token AAL1 → REST directo (RLS no chequea `aal`) | **Alta** |
| RT-02 | Cuenta/proyecto | `otp?create_user=true` → cuenta → proyecto con email "colgado" | Media |
| RT-04 | Detección | Abuso admin sin dejar rastro (falta `audit_log`) | Media |
| RT-03 | Integridad | UPDATE de `milestone_approvals` con `project_id` ajeno | Baja |
| RT-05 | Sesión | XSS → robo de JWT de `localStorage` | Info |

## 7. Entregables
- [x] Informe por cadena (`informe-cadena-ataque.md`)
- [x] Tabla de hallazgos individuales (`informe-hallazgos.md`, formato `../app-security/assets/report-template.md`)
- [x] Detección / purple team (sección por cadena)
- [x] Plan de remediación priorizado (choke point: `is_admin_aal2()`)
- [ ] Fecha de retest (a coordinar tras aplicar los fixes)
