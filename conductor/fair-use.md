# Vercel Hobby — Fair-use y guardrails

> Este proyecto se despliega en el **plan Hobby de Vercel** (uso personal, no comercial).
> Documento de referencia para mantener el deploy dentro de la fair-use mientras se siga en Hobby.
> Track asociado: [`fairuse_20261008`](./tracks/fairuse_20261008/).

---

## Por qué existe este documento

La fair-use de Vercel restringe Hobby a *personal, non-commercial use*: cualquier deployment usado para la ganancia financiera de quienes lo construyen queda fuera. Un sitio portfolio con CTAs de venta es una zona gris tolerada; lo que sí lo cruza de forma clara es **operar el negocio en la plataforma**: procesar pagos, facturar, o gestionar cobros desde el mismo deploy.

Por eso el producto fue ajustado (track `fairuse_20261008`): el panel admin/cliente es **project management** (proyectos, etapas, hitos, aprobaciones, mensajes, passkeys), no un sistema de billing.

## Límites Hobby vigentes (consulta: 2026-10)

- 100 GB de *fast data transfer* / mes
- 1M *edge requests* + 1M *function invocations* / mes (este proyecto: **0 functions**)
- 4 h CPU activa, 360 GB-h de memoria de funciones
- 6.000 min de build / mes, 100 deployments/día, 1 concurrent build
- Sin overage facturable: al superar un límite, la feature se pausa

## Reglas (no negociables mientras estemos en Hobby)

1. **Cero serverless functions para el negocio.** No crear carpeta `api/`, edge functions ni middleware transaccional. Toda la lógica del sitio es client-side; las llamadas externas van directas desde el browser a Supabase y Web3Forms.
2. **Cero cobros/transactions en este deploy.** Ningún checkout, pasarela de pago, suscripción ni procesamiento de pagos vía Vercel.
3. **Cero gestión de montos en el panel.** `payments`, `amount`, `currency` fueron eliminados (migración `0002_drop_billing.sql`). No reintroducirlos: si vuelven los cobros gestionables, toca Pro u otro hosting.
4. **El estimador es 100% client-side.** Si algún día se necesita server-side (IA, cotización dinámica real), evaluar antes Pro u otro runtime.
5. **Copy comercial sí, operación no.** CTAs, FAQ de pagos y precios "desde" son marketing permitido; lo prohibido es la operación transaccional en la plataforma.
6. **Datos de clientes backups** nunca se versionan: `supabase/backups/` está en `.gitignore`.

## Señales de que toca migrar a Pro (o a otro hosting)

- El sitio cobra por sus servicios directamente (SaaS, membresías, e-commerce propio).
- Se necesita procesamiento server-side recurrente (cron, jobs, IA).
- Se superan los límites de transferencia/build/invocaciones.
- Aparece contenido detrás de paywall o anuncios.

## Anti-patrones a revisar en cada code review

- `api/`, `functions/`, `@vercel/node`, `edge` config en `vercel.json`
- Imports de `stripe`, `mercadopago`, `paypal`, `checkout`
- Inputs/renders de montos en `src/pages/admin/` o `src/pages/client/`
- Tablas o columnas de dinero nuevas en `supabase/migrations/`
- `fetch` a APIs propias (debe ir a terceros: Supabase, Web3Forms)
