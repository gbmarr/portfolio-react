# 22 · Factores humanos y organizacionales

## Riesgos
- Phishing, spear phishing, vishing, BEC (compromiso de email empresarial), ingeniería social contra soporte/helpdesk.
- *Insider threats* (maliciosos y accidentales); *offboarding* deficiente; accesos heredados.
- *Shadow IT/SaaS*, cuentas de servicio huérfanas, tokens personales en sistemas productivos.
- Dependencia de personas clave (*bus factor*); conocimiento no documentado.
- Documentación desactualizada; runbooks inexistentes.
- Fatiga de alertas; cultura de culpa que oculta incidentes.
- Compartir credenciales; contraseñas en chats/planillas.
- Dispositivos personales sin gestión (BYOD); pérdida/robo de equipos.

## Controles
- **Concientización continua**, simulacros de phishing, capacitación por rol (devs: desarrollo seguro; soporte: verificación de identidad; finanzas: BEC).
- **Ciclo de vida de accesos** (joiner/mover/leaver) automatizado con IdP/SCIM; baja inmediata de accesos y tokens al desvincular; revisión trimestral de accesos.
- **Segregación de funciones**; **break-glass accounts** auditadas y alertadas; **PAM/JIT** (acceso privilegiado temporal y con aprobación) y grabación de sesiones.
- Verificación de identidad robusta en soporte (no reset de MFA por teléfono sin proceso); doble canal para transferencias o cambios de datos bancarios.
- **Gestión de dispositivos** (MDM/EDR), cifrado de disco, bloqueo de pantalla, borrado remoto.
- Gestor de contraseñas corporativo; prohibir compartir credenciales; MFA resistente a phishing (FIDO2) para administradores.
- **Políticas claras**: uso aceptable, clasificación de datos, trabajo remoto, gestión de proveedores, reporte de incidentes sin represalias.
- **Documentación operativa** viva: arquitectura, runbooks, contactos, dependencias; rotación de responsabilidades para reducir bus factor.
- Programa de **proveedores**: evaluación de seguridad, cláusulas contractuales, revisión de accesos de terceros.
- Cultura de seguridad: *security champions*, métricas, reconocimiento por reportes.
