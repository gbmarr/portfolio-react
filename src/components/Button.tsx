import type { MouseEventHandler, ReactNode } from 'react'
import { baseButtonClasses, buttonSizeClasses } from './buttonClasses'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
  href?: string
  target?: string
  rel?: string
  type?: 'button' | 'submit' | 'reset'
  className?: string
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

const variantClasses = {
  // Aclarar en hover (no oscurecer): sobre fondo oscuro un botón que se
  // apaga parece deshabilitado justo cuando el usuario lo apunta.
  primary: 'bg-accent text-background hover-fine:bg-accent-hover',
  secondary: 'border border-border text-text hover-fine:border-accent hover-fine:text-accent',
} as const

const disabledClasses = 'cursor-not-allowed opacity-60'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  target,
  rel,
  type = 'button',
  className = '',
  disabled = false,
  onClick,
}: ButtonProps) {
  const classes = `${baseButtonClasses} ${buttonSizeClasses[size]} ${variantClasses[variant]} ${disabled ? disabledClasses : ''} ${className}`

  // Un ancla no puede estar deshabilitada: si no hay destino válido, el
  // elemento correcto es un button.
  if (href && !disabled) {
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
