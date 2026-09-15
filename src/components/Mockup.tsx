interface MockupProps {
  alt: string
  src?: string
  /** Si no hay captura, se muestran iniciales. */
  initials?: string
  variant?: 'phone' | 'desktop'
}

/** Marco visual para capturas de sitios, en formato celular o escritorio. */
export function Mockup({ alt, src, initials, variant = 'desktop' }: MockupProps) {
  const isPhone = variant === 'phone'

  return (
    <div
      className={
        isPhone
          ? 'relative mx-auto w-[190px] rounded-[2rem] border-4 border-border bg-background p-2 shadow-glow'
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
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-3xl font-semibold text-text-muted">
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}