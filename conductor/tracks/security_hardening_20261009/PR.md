## Summary

Remediación de la auditoría `security-audit` (run `portfolio-run-1`) sobre RLS, superficie de contacto, CSP, contexto de deploy y tenancy por email. Cero serverless: todo es RLS + código cliente.

```diff
 supabase/migrations/
+├── 0005_security_hardening.sql    # briefs column-scope, client_visible, subject/read_at, drop notes
+└── 0006_email_tenancy.sql          # lower(email) único + resync en auth.users UPDATE
 src/
+├── utils/contactSafety.ts          # safeMailtoAddress / hasControlChars
+├── indexHtml.test.ts               # guardrail: sin handlers inline
 ├── lib/types.ts                    # quita notes
 └── pages/admin/
     ├── MessagesPage.tsx            # mailto solo con email seguro
     └── ProjectDetailPage.tsx       # deja de enviar notes
 index.html                          # fuente sin onload inline
 vercel.json / netlify.toml          # CSP sin script-src-attr 'unsafe-inline'
 .vercelignore                       # excluye árboles no-release
```

Ruta de contacto (después):

```text
ContactForm.handleSubmit
  validate (caps + sin chars de control)
  submitContactForm (Web3Forms, chequeos server-side del proveedor)
    persistToPanel
      saveContactMessage → contact_messages (RLS insert anon)
        trigger normalize_contact_message (read_at=null, created_at=now())
```

Respuesta del admin (después):

```diff
- href={`mailto:${message.email}?subject=${encodeURIComponent(...)}`}
+ const replyAddress = safeMailtoAddress(message.email)   // solo si es email seguro
+ replyAddress
+   ? <a href={`mailto:${replyAddress}?subject=${encodeURIComponent(...)}`}>Responder por email</a>
+   : <span>{message.email}</span>
```

RLS de etapas (después):

```diff
 using (
   public.is_admin()
-  or exists (select 1 from projects p join profiles pr on pr.id = auth.uid()
-             where p.id = project_id and lower(pr.email) = p.client_email)
+  or (
+    client_visible
+    and exists (select 1 from projects p join profiles pr on pr.id = auth.uid()
+                where p.id = project_id and lower(pr.email) = p.client_email)
+  )
 )
```

## Evidence

- **Before:** `test` 407; `mailto` con email crudo; CSP con `script-src-attr 'unsafe-inline'`; `project_stages` devolvía etapas `client_visible=false` y `notes`; `project_briefs` permitía al cliente sobreescribir `service_type`/`extra_ids`; `subject` sin límite.
  **After:** `npm run lint` 0 errores (2 warnings preexistentes) · `npm run test` **408/408** (66 archivos) · `npm run build` ✅ · `npm run typecheck` ✅. Migraciones `0005`/`0006` aplicadas y verificadas; resync de email confirmado con prueba transaccional + `rollback`.

## Merge Danger

**Door:** one-way

Las migraciones `0005`/`0006` **ya están aplicadas en la DB**. `0005` elimina `project_stages.notes`, así que la app desplegada (código previo, aún enviando `notes: null`) fallará al crear/editar etapas hasta deployar este cambio. No hay rollback limpio del esquema sin restaurar `notes`.

**Blast Radius:** admin

Alta/edición de etapas, ingesta de contacto, visibilidad de etapas del cliente. También cambia la carga de fuentes (ahora stylesheet bloqueante, antes `preload`+`onload`).

---

### Fuera de alcance (riesgos aceptados)

- Antispam server-side del formulario de contacto (exigiría serverless; ver propuesta de rate-limit en DB).
- Restricción de dominio en Web3Forms (no disponible en el plan; cuota 250/mes).
- Passkey step-up (Supabase no expone AAL; fix client-side es evitable — documentado).
- Escaneo de CVEs de dependencias.
