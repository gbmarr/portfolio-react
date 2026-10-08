-- 0002_drop_billing.sql
-- Track: fairuse_20261008 — retiro de toda gestión monetaria del producto.
-- Contexto: el sitio vive en Vercel Hobby (uso no comercial). El panel pasa a ser
-- pura gestión de proyectos; el dinero solo aparece como estimación pública
-- (estimador client-side), nunca como cobros registrados.
-- Precondición: respaldo en supabase/backups/2026-10-08_billing/ (ver README).
-- Aplicación: supabase db push (proyecto vinculado) o SQL Editor.

-- 1) Tabla de pagos completa (datos, RLS y constraints).
drop table if exists public.payments;

-- 2) Columnas de monto del proyecto (la FK/RLS de projects no se toca).
alter table public.projects drop column if exists amount;
alter table public.projects drop column if exists currency;
