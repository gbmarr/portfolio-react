import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { panelCopy } from '../data/panel'

/** Opciones del hook `useAsyncData`. */
export interface UseAsyncDataOptions {
  /** Convierte el error capturado en el mensaje a mostrar. Por defecto, el genérico. */
  mapError?: (error: unknown) => string
}

/** Estado de carga de datos asíncronos más utilidades de refresco. */
export interface AsyncDataResult<T> {
  data: T | null
  error: string | null
  loading: boolean
  /**
   * Vuelve a ejecutar el loader sin pasar por el estado de carga (para refrescos
   * posteriores a una acción). Si el loader falla, propaga el error sin tocar el
   * estado actual, para que quien llama decida cómo avisar.
   */
  reload: () => Promise<void>
  /** Actualiza los datos localmente (p. ej. de forma optimista) sin refetch. */
  setData: (updater: T | null | ((current: T | null) => T | null)) => void
}

const defaultMapError = (): string => panelCopy.error.generic

function depsAreEqual(a: DependencyList, b: DependencyList): boolean {
  if (a.length !== b.length) return false
  for (let index = 0; index < a.length; index += 1) {
    if (!Object.is(a[index], b[index])) return false
  }
  return true
}

/**
 * Carga datos asíncronos con cancelación y expone una interfaz mínima.
 *
 * El `loader` vive en un ref: su identidad no dispara recargas, sólo `deps` lo
 * hace. Esto evita bucles cuando el loader se define inline en cada render.
 */
export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList,
  options: UseAsyncDataOptions = {}
): AsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loaderRef = useRef(loader)
  const mapErrorRef = useRef(options.mapError)
  const mountedRef = useRef(true)
  const [prevDeps, setPrevDeps] = useState(deps)

  // Mantiene los refs al día sin escribirlos durante el render.
  useEffect(() => {
    loaderRef.current = loader
    mapErrorRef.current = options.mapError
  })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Al cambiar las deps, vuelve al estado de carga ajustando el estado en el
  // render (patrón oficial de React) en vez de un efecto.
  if (!depsAreEqual(prevDeps, deps)) {
    setPrevDeps(deps)
    setLoading(true)
    setError(null)
  }

  useEffect(() => {
    let cancelled = false

    loaderRef
      .current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
        setLoading(false)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setData(null)
        setError((mapErrorRef.current ?? defaultMapError)(caught))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // `deps` define cuándo recargar; `loader`/`mapError` viven en refs a propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])

  const reload = useCallback(async () => {
    const result = await loaderRef.current()
    if (mountedRef.current) {
      setData(result)
      setError(null)
      setLoading(false)
    }
  }, [])

  const updateData = useCallback((updater: T | null | ((current: T | null) => T | null)) => {
    setData((current) =>
      typeof updater === 'function' ? (updater as (value: T | null) => T | null)(current) : updater
    )
  }, [])

  return { data, error, loading, reload, setData: updateData }
}
