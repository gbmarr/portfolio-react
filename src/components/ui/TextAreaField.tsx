import type { TextareaHTMLAttributes } from 'react'
import { fieldClasses } from './FormField'

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  /** Oculta visualmente el label (queda para lectores de pantalla). */
  hideLabel?: boolean
}

/** Textarea con label, estandarizado con el resto de los formularios. */
export function TextAreaField({
  id,
  label,
  value,
  onValueChange,
  hideLabel = false,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-medium text-text ${hideLabel ? 'sr-only' : ''}`}
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={fieldClasses}
        {...textareaProps}
      />
    </div>
  )
}
