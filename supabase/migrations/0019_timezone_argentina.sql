-- Zona horaria del sistema: Argentina.
-- Los timestamptz siguen almacenando el instante UTC; este setting afecta
-- la interpretación/visualización de fechas en sesiones nuevas (casts, now()::date, etc.).
alter database postgres set timezone = 'America/Argentina/Buenos_Aires';

-- Aplica también a la sesión actual (SQL Editor / CLI).
set timezone = 'America/Argentina/Buenos_Aires';
