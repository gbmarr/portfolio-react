import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  href?: string
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

const variantClasses = {
  primary: 'bg-accent text-background hover:bg-accent/90',
  secondary: 'border border-border text-text hover:border-accent hover:text-accent',
} as const

export function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  className = '',
}: ButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  )
}
