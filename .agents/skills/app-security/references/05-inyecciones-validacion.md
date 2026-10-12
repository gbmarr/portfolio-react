# 05 · Validación de entrada, codificación de salida e inyecciones

## Amenazas
- SQL injection (in-band, *blind*, *time-based*, *second-order*, ORDER BY/columnas dinámicas).
- NoSQL injection (operadores `$ne`, `$where`, JSON/BSON).
- OS command injection y argument injection (flags `-`, `--`).
- LDAP, XPath, XQuery, JNDI/Log4Shell, SpEL/OGNL/EL injection.
- **SSTI** (Jinja2, Twig, Freemarker, Velocity, Handlebars…).
- **XXE** y XML bombs (*billion laughs*, *quadratic blowup*).
- **Deserialización insegura** (Java ObjectInputStream, .NET BinaryFormatter, PHP `unserialize`, Python `pickle`/`yaml.load`, Ruby Marshal).
- CRLF injection, *response splitting*, HTTP header injection.
- Log injection/forging. Email header injection. CSV/Formula injection.
- Prototype pollution (JS), parameter pollution (HPP), type juggling (PHP, JS), mass assignment.
- ReDoS (regex catastróficas).
- Inyección en GraphQL, ORM/query builders mal usados (`raw`, `$queryRawUnsafe`, `extra()`).
- Unicode/encoding bypasses (normalización, homoglyphs, doble codificación, null bytes).
- Integer overflow, truncamiento, precisión de punto flotante.

## Controles
- **Consultas parametrizadas / prepared statements** o ORM seguro. Nunca concatenar. Para identificadores dinámicos (columnas, ORDER BY): allowlist.
- **Validación positiva (allowlist) en el servidor**: tipo, longitud, rango, formato, esquema (JSON Schema, OpenAPI, Zod, Pydantic, Bean Validation). Rechazar campos desconocidos.
- Canonicalizar/normalizar (Unicode NFC, rutas) **antes** de validar.
- **Codificación contextual de salida** (HTML body, atributo, JS, URL, CSS). Preferir frameworks con auto-escape.
- Evitar `eval`, `exec`, `system`, `Runtime.exec`, shell=True. Usar APIs con argumentos separados (`execFile`, `subprocess.run([..])`) y `--` para fin de opciones.
- XML: deshabilitar DTD y entidades externas; límites de tamaño/profundidad/expansión.
- **No deserializar datos no confiables**. Si es inevitable: formatos simples (JSON), firma/HMAC, allowlist de tipos, `yaml.safe_load`.
- Plantillas: nunca construir plantillas con input de usuario; motor en sandbox.
- Regex con límites o motores de tiempo lineal (RE2); timeouts de matching.
- Prototype pollution: `Object.create(null)`, bloquear `__proto__`/`constructor`/`prototype`, `Map`, esquemas estrictos.
- Sanitización de logs (neutralizar saltos de línea) y neutralización de fórmulas (`= + - @` prefijados con `'`) en exportaciones CSV/XLSX.
- Límites de tamaño de body, profundidad JSON, cantidad de parámetros.
- Dinero: tipos decimales/enteros (centavos), nunca float.

## Ejemplos
```python
# ✅ SQL parametrizado
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
# ✅ ORDER BY con allowlist
col = {"name": "name", "date": "created_at"}.get(sort, "created_at")
# ✅ Comando sin shell
subprocess.run(["convert", "--", src, dst], check=True, timeout=10)
# ✅ YAML seguro
yaml.safe_load(data)
```

## Anti-patrones (grep)
`"SELECT ... " +`, `f"... {var}"` en SQL, `.raw(`, `exec(`, `eval(`, `shell=True`, `child_process.exec(`, `pickle.loads`, `unserialize(`, `ObjectInputStream`, `BinaryFormatter`, `yaml.load(`, `render_template_string(`, `new Function(`, `$where`.
