# 04 · Autorización y control de acceso

## Amenazas
- **IDOR/BOLA**: acceso a objetos ajenos cambiando un ID (path, query, body, header, GraphQL).
- **BFLA**: acceso a funciones administrativas o de otro rol.
- Escalada de privilegios horizontal y vertical.
- **Mass assignment / BOPLA**: el cliente envía `role`, `isAdmin`, `price`, `ownerId`.
- Confianza en datos del cliente (rol, precio, ID de usuario, tenant).
- Falta de autorización en rutas "ocultas", endpoints de debug, métodos HTTP alternativos (HEAD/OPTIONS/PUT), versiones viejas de API, jobs/colas/exports.
- Multi-tenancy rota (fuga entre inquilinos por queries sin filtro de tenant, cachés compartidas, archivos, búsquedas, logs).
- Forced browsing, autorización solo en front-end.
- Confused deputy (servicio con más permisos que quien lo invoca).
- Acceso indirecto: URLs prefirmadas sin expiración, enlaces compartidos públicos, exports.

## Controles
- **Deny by default**; autorización centralizada en el servidor, en **cada request** y a **nivel de objeto y de propiedad**.
- Modelo explícito: RBAC, ABAC, ReBAC (Zanzibar/OpenFGA/SpiceDB) o policy-as-code (OPA/Rego, Cedar).
- Mínimo privilegio y segregación de funciones; separar roles de administración y de operación.
- Aislamiento de tenants a nivel de datos: row-level security (PostgreSQL RLS), filtro obligatorio en el repositorio/ORM (scope global), o esquema/BD por tenant. Tests automatizados de fuga entre tenants.
- DTOs/allowlists de campos de entrada y de salida; nunca bindear el body directo al modelo.
- IDs no predecibles (UUIDv4/v7) **como defensa adicional**, nunca como control principal.
- Derivar la identidad del usuario del token/sesión, no de parámetros enviados.
- Revisión periódica de permisos (*access recertification*), caducidad de accesos temporales.
- Tests de autorización: matriz rol × endpoint × objeto propio/ajeno, incluyendo casos negativos.
- URLs prefirmadas con expiración corta y alcance mínimo.
- Acciones críticas: aprobación de doble control (4-eyes) y auditoría.

## Patrón seguro (pseudocódigo)
```python
def get_invoice(user, invoice_id):
    inv = repo.find(invoice_id)
    if inv is None or not policy.can(user, "read", inv):   # 404 uniforme para no filtrar existencia
        raise NotFound()
    return InvoiceDTO.from_model(inv)                      # solo campos permitidos
```

## Anti-patrones
- `Model.findById(req.params.id)` sin comprobar propietario/tenant.
- `Object.assign(user, req.body)` / `**request.json` / `@RequestBody Entity`.
- Ocultar botones en UI como control de acceso.
- Verificar rol solo en el middleware de la ruta principal, no en rutas alternativas o jobs.
