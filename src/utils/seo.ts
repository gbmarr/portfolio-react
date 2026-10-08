export interface SeoMeta {
  title: string
  description: string
  locale: string
  ogImage?: string
  siteName?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function applySeoMeta(meta: SeoMeta): void {
  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:locale', meta.locale)
  setMeta('property', 'og:type', 'website')
  if (meta.ogImage) setMeta('property', 'og:image', meta.ogImage)
  if (meta.siteName) setMeta('property', 'og:site_name', meta.siteName)
}

/** Rutas que no deben indexarse (accesos y paneles privados). */
const PRIVATE_PATH_PREFIXES = ['/login', '/acceso-admin', '/admin', '/panel']

/** `true` si la ruta corresponde a una superficie privada del sitio. */
export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Meta robots por ruta (complementa los headers X-Robots-Tag del deploy):
 * `noindex, nofollow` en rutas privadas; en públicas elimina la meta para no
 * dejar rastro de una navegación anterior dentro de la SPA.
 */
export function applyRobotsMeta(pathname: string): void {
  if (isPrivatePath(pathname)) {
    setMeta('name', 'robots', 'noindex, nofollow')
    return
  }
  document.head.querySelector('meta[name="robots"]')?.remove()
}
