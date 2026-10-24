/**
 * Clases compartidas de botón.
 *
 * Viven fuera de `Button.tsx` para que el archivo exporte solo componentes
 * (react-refresh) y para que casos que no pueden ser `<button>` ni `<a>`
 * —por ejemplo un `<Link>` de react-router o un color propio del panel—
 * reusen el mismo feedback de press sin duplicar estilos.
 */
export const baseButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const buttonSizeClasses = {
  md: 'px-6 py-3',
  sm: 'px-4 py-2 text-sm',
} as const
