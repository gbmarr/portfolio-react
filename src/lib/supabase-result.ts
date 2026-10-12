/**
 * Desenvolvío único de resultados PostgREST.
 *
 * Concentra el patrón "si hay error, lanzar; si no, devolver los datos" que
 * antes estaba copiado, con cuatro variantes distintas, en cada módulo de la
 * capa de datos (`projects`, `briefs`, `clients`, `messages`).
 */

export type Result<T> = { data: T | null; error: { message: string } | null }

/** Registro único: exige un dato; si es `null`, lanza `notFoundMessage`. */
export function unwrap<T>(result: Result<T>, notFoundMessage = 'No se encontró el registro'): T {
  if (result.error) throw new Error(result.error.message)
  if (result.data === null) throw new Error(notFoundMessage)
  return result.data
}

/** Lista: error → lanza; sin datos → lista vacía. */
export function unwrapList<T>(result: Result<T[]>): T[] {
  if (result.error) throw new Error(result.error.message)
  return result.data ?? []
}

/** Quizá: error → lanza; sin datos → `null` (para `maybeSingle`). */
export function unwrapMaybe<T>(result: Result<T>): T | null {
  if (result.error) throw new Error(result.error.message)
  return result.data
}

/** Operaciones sin datos (delete/update): error → lanza. */
export function throwIfError(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(result.error.message)
}
