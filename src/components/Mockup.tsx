interface MockupProps {
  alt: string
  src?: string
  /** Variantes de ancho para que el navegador elija según DPR. */
  srcSet?: string
  /** Si no hay captura, se muestran iniciales. */
  initials?: string
  variant?: 'phone' | 'desktop'
}

/** Marco visual para capturas de sitios, en formato celular o escritorio. */
export function Mockup({ alt, src, srcSet, initials, variant = 'desktop' }: MockupProps) {
  const isPhone = variant === 'phone'

  return (
    <div
      className={
        isPhone
          ? 'relative mx-auto w-full max-w-[190px] rounded-[2rem] border-4 border-border bg-background p-2 shadow-glow'
          : 'relative overflow-hidden rounded-xl border border-border bg-background shadow-glow'
      }
    >
      {isPhone && (
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-surface-light" aria-hidden="true" />
      )}
      <div
        className={
          isPhone
            ? 'aspect-[9/19] overflow-hidden rounded-[1.4rem] bg-surface-light/40'
            : 'flex aspect-video items-center justify-center bg-surface-light/40'
        }
      >
        {src ? (
          <img
            src={src}
            srcSet={srcSet}
            sizes={srcSet ? (isPhone ? '190px' : '(min-width: 768px) 50vw, 100vw') : undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`h-full w-full ${isPhone ? 'object-contain' : 'object-cover'}`}
          />
        ) : (
          <span className="font-display text-3xl font-semibold text-text-muted">
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}