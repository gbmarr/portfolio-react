import { useCallback, useEffect, useState } from 'react'
import { normalizeEmail } from '../utils/email'

export const LOGIN_COOLDOWN_STORAGE_KEY = 'portfolio-login-cooldown'
export const LOGIN_COOLDOWN_MS = 60_000

type StoredCooldown = {
  email: string
  until: number
}

function readCooldown(): StoredCooldown | null {
  try {
    const raw = window.localStorage.getItem(LOGIN_COOLDOWN_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredCooldown).email !== 'string' ||
      typeof (parsed as StoredCooldown).until !== 'number'
    ) {
      return null
    }
    return parsed as StoredCooldown
  } catch {
    return null
  }
}

/**
 * Cooldown de reenvío de enlaces mágicos, persistido por email normalizado.
 * Complementa el mínimo nativo de Supabase (60 s por usuario) con feedback
 * inmediato y una barrera del lado del cliente.
 */
export function useEmailCooldown(email: string) {
  const normalized = normalizeEmail(email)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!normalized) return

    function tick() {
      const stored = readCooldown()
      if (!stored || stored.email !== normalized) {
        setRemaining(0)
        return
      }
      const seconds = Math.max(0, Math.ceil((stored.until - Date.now()) / 1000))
      setRemaining(seconds)
      if (seconds === 0) {
        try {
          window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY)
        } catch {
          // localStorage puede estar bloqueado; el estado local ya quedó en 0.
        }
      }
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [normalized])

  const start = useCallback((targetEmail: string) => {
    const until = Date.now() + LOGIN_COOLDOWN_MS
    try {
      window.localStorage.setItem(
        LOGIN_COOLDOWN_STORAGE_KEY,
        JSON.stringify({ email: normalizeEmail(targetEmail), until })
      )
    } catch {
      // Sin persistencia, el cooldown sigue activo durante esta sesión.
    }
    setRemaining(Math.ceil(LOGIN_COOLDOWN_MS / 1000))
  }, [])

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(LOGIN_COOLDOWN_STORAGE_KEY)
    } catch {
      // Ignorar almacenamiento no disponible.
    }
    setRemaining(0)
  }, [])

  const activeRemaining = normalized ? remaining : 0

  return {
    remaining: activeRemaining,
    start,
    clear,
    coolingDown: activeRemaining > 0,
  }
}
