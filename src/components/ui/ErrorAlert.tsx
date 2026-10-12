import type { ReactNode } from 'react'

interface ErrorAlertProps {
  children: ReactNode
}

/** Aviso de error compartido por las páginas del panel (rol `alert`). */
export function ErrorAlert({ children }: ErrorAlertProps) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {children}
    </p>
  )
}
