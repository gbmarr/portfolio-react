import type { InputHTMLAttributes } from 'react'

/** Clases compartidas de todos los campos de formulario del sistema. */
export const fieldClasses =
  'w-full rounded-lg border border-border bg-background px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
}

/** Input con label, estandarizado con el resto de los formularios del sitio. */
export function FormField({ id, label, value, onValueChange, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={fieldClasses}
        {...inputProps}
      />
    </div>
  )
}
