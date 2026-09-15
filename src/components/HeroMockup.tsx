interface HeroMockupProps {
  variant?: 'phone' | 'desktop'
}

/**
 * Ilustración decorativa (SVG inline) de una landing de negocio.
 * No es una captura real: es un placeholder estilizado que muestra el tipo
 * de sitio que se vende. Es puramente decorativo (aria-hidden), pesa ~2 KB
 * y reemplaza screenshots pesados en el hero sin romper la prueba visual.
 */
export function HeroMockup({ variant = 'desktop' }: HeroMockupProps) {
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
            : 'aspect-video overflow-hidden bg-surface-light/40'
        }
      >
        {isPhone ? <PhoneScene /> : <DesktopScene />}
      </div>
    </div>
  )
}

function DesktopScene() {
  return (
    <svg
      viewBox="0 0 400 225"
      className="block h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Barra del navegador */}
      <rect width="400" height="34" rx="8" fill="#1e293b" />
      <circle cx="18" cy="17" r="5" fill="#22d3ee" opacity="0.85" />
      <circle cx="34" cy="17" r="5" fill="#8b5cf6" opacity="0.85" />
      <circle cx="50" cy="17" r="5" fill="#334155" />
      <rect x="64" y="10" width="322" height="14" rx="7" fill="#0f172a" />

      {/* Navegación del sitio */}
      <rect x="24" y="46" width="28" height="12" rx="4" fill="#22d3ee" />
      <rect x="300" y="50" width="40" height="6" rx="3" fill="#334155" />
      <rect x="344" y="50" width="40" height="6" rx="3" fill="#334155" />

      {/* Titular + botón */}
      <rect x="24" y="92" width="152" height="16" rx="8" fill="#f8fafc" />
      <rect x="24" y="116" width="118" height="10" rx="5" fill="#94a3b8" />
      <rect x="24" y="132" width="140" height="10" rx="5" fill="#334155" />
      <rect x="24" y="158" width="96" height="28" rx="14" fill="#22d3ee" />

      {/* Imagen destacada */}
      <rect x="216" y="84" width="160" height="120" rx="10" fill="#1e293b" />
      <rect x="216" y="84" width="160" height="48" rx="10" fill="#8b5cf6" opacity="0.35" />
      <circle cx="248" cy="118" r="10" fill="#22d3ee" opacity="0.5" />
      <circle cx="338" cy="118" r="14" fill="#8b5cf6" opacity="0.3" />
    </svg>
  )
}

function PhoneScene() {
  return (
    <svg
      viewBox="0 0 180 380"
      className="block h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* Barra de estado */}
      <rect x="16" y="12" width="56" height="8" rx="4" fill="#334155" />
      <rect x="122" y="12" width="42" height="8" rx="4" fill="#334155" />

      {/* Navegación */}
      <rect x="16" y="36" width="24" height="10" rx="5" fill="#22d3ee" />
      <rect x="122" y="39" width="42" height="6" rx="3" fill="#334155" />

      {/* Titular + botón */}
      <rect x="16" y="68" width="148" height="16" rx="8" fill="#f8fafc" />
      <rect x="16" y="92" width="112" height="10" rx="5" fill="#94a3b8" />
      <rect x="16" y="108" width="132" height="10" rx="5" fill="#334155" />
      <rect x="16" y="134" width="88" height="26" rx="13" fill="#22d3ee" />

      {/* Imagen destacada */}
      <rect x="16" y="176" width="148" height="92" rx="10" fill="#1e293b" />
      <rect x="16" y="176" width="148" height="38" rx="10" fill="#8b5cf6" opacity="0.35" />
      <circle cx="46" cy="214" r="9" fill="#22d3ee" opacity="0.5" />

      {/* Bloques de texto */}
      <rect x="16" y="288" width="148" height="9" rx="4.5" fill="#334155" />
      <rect x="16" y="304" width="124" height="9" rx="4.5" fill="#334155" />

      {/* Navegación inferior */}
      <rect x="40" y="336" width="100" height="10" rx="5" fill="#1e293b" />
    </svg>
  )
}