import type { Benefit, BenefitIcon } from '../data/types'

interface BenefitCardProps {
  benefit: Benefit
}

/** Iconos SVG inline por beneficio (trazo simple, coherente con el resto del sitio). */
function BenefitIconGlyph({ icon }: { icon: BenefitIcon }) {
  const common = {
    className: 'h-6 w-6',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (icon) {
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
          <path d="M3 12h18" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 01-8 8H7l-4 3v-6a8 8 0 018-8h2a8 8 0 018 3z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20a6 6 0 0112 0" />
          <path d="M16 5a3 3 0 010 6" />
          <path d="M21 20a5 5 0 00-4-4.9" />
        </svg>
      )
  }
}

/** Tarjeta de beneficio: por qué le conviene a un negocio tener un sitio web. */
export function BenefitCard({ benefit }: BenefitCardProps) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <BenefitIconGlyph icon={benefit.icon} />
      </span>
      <h3 className="font-display text-lg font-semibold text-text sm:text-xl">{benefit.title}</h3>
      <p className="text-sm text-text-muted">{benefit.description}</p>
    </article>
  )
}
