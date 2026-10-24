import type { Service } from '../data/types'
import { copy } from '../data/copy'
import { Button } from './Button'

interface ServiceCardProps {
  service: Service
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** Tarjeta de servicio: para quién es, qué incluye, qué necesito, plazo y CTA. */
export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-surface p-6 transition-[transform,border-color] duration-200 ease-out hover-fine:-translate-y-1 hover-fine:border-accent/40 hover-fine:shadow-glow motion-reduce:hover-fine:translate-y-0 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold text-text">{service.name}</h3>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {copy.services.budgetBadge}
        </span>
      </div>
      <p className="text-text-muted">{service.audience}</p>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text">
            {copy.services.includesLabel}
          </p>
          <ul className="space-y-2">
            {service.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            {copy.services.requiresLabel}
          </p>
          <ul className="space-y-2">
            {service.requires.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <span className="text-sm text-text-muted">
          {copy.services.timelineLabel}: {service.timeline}
        </span>
      </div>

      <div className="mt-auto">
        <Button href="#estimador" className="w-full">
          {copy.services.ctaLabel}
        </Button>
      </div>
    </article>
  )
}
