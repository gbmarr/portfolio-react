# 15 · Aplicaciones móviles y de escritorio (OWASP MASVS/MASTG)

## Amenazas
- Almacenamiento inseguro (SharedPreferences, UserDefaults, plist, SQLite sin cifrar, logs, backups del SO, caché, keyboard cache).
- Comunicación insegura; ausencia de validación de certificados o de *certificate pinning*.
- Ingeniería inversa, ofuscación débil, secretos/API keys embebidos en el binario, lógica de licencias/autorización en el cliente.
- Deep links / Intents / URL schemes hijacking; componentes exportados (Activities, Services, Receivers, Providers).
- WebViews inseguras (JS habilitado con contenido no confiable, JS bridge, `file://`, `allowUniversalAccessFromFileURLs`).
- Dispositivos rooteados/jailbreak, hooking (Frida/Xposed), apps reempaquetadas/clonadas, emuladores.
- Portapapeles, capturas de pantalla, grabación, *screen overlay* / tapjacking.
- Permisos excesivos; SDKs de terceros que exfiltran datos.
- Biometría mal implementada (solo booleano sin ligar a clave).
- Actualizaciones forzadas ausentes; versiones vulnerables en circulación.

## Controles
- **Almacenamiento seguro**: Keychain (iOS) / Keystore + EncryptedSharedPreferences/EncryptedFile (Android); datos mínimos en el dispositivo; excluir de backups lo sensible; limpiar al logout.
- **TLS con pinning** (de clave pública, con pins de respaldo y estrategia de rotación); ATS/Network Security Config sin excepciones cleartext.
- **Attestation**: Play Integrity API, App Attest/DeviceCheck; detección de root/jailbreak/hooking como **señal de riesgo**, no único control; verificación de firma de la app.
- **Deep links**: App Links/Universal Links verificados, validar parámetros, no ejecutar acciones sensibles sin confirmación y autenticación.
- Componentes Android `exported=false` por defecto; permisos con `signature` para IPC interno; `FLAG_IMMUTABLE` en PendingIntents.
- **WebView**: deshabilitar JS si no es necesario, no cargar contenido no confiable, sin `file://`, restringir navegación a allowlist, no exponer interfaces nativas.
- **Ofuscación y protección** (R8/ProGuard, strip de símbolos, RASP, anti-tamper) como capa adicional.
- **Biometría** ligada a claves criptográficas (`setUserAuthenticationRequired`, `kSecAccessControlBiometryCurrentSet`), no solo `if (success)`.
- **Sesión**: tokens de corta vida, refresh rotatorio, almacenamiento seguro, logout remoto, bloqueo por inactividad.
- **Sin secretos en el binario**: usar backend/proxy; si se necesita una clave de cliente, restringirla (por paquete/bundle, cuotas).
- Ocultar contenido en el *app switcher*; `FLAG_SECURE` en pantallas sensibles; limpiar el portapapeles.
- **Política de versiones mínimas** y *kill switch*/force update.
- Permisos mínimos y revisión de SDKs (privacidad, red, telemetría).
- **Desktop/Electron/Tauri**: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, CSP, `webSecurity` activo, validar IPC y `ipcMain` por origen, deshabilitar `enableRemoteModule`, no cargar contenido remoto con privilegios, **actualizaciones firmadas** y verificadas, protocolos custom validados.
