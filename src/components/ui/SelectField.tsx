import type { SelectHTMLAttributes } from 'react'
import { fieldClasses } from './FormField'

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  /** Oculta visualmente el label (queda para lectores de pantalla). */
  hideLabel?: boolean
}

/** Select con label, estandarizado con el resto de los formularios. */
export function SelectField({
  id,
  label,
  value,
  onValueChange,
  options,
  hideLabel = false,
  ...selectProps
}: SelectFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-medium text-text ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={fieldClasses}
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
