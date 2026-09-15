import type { Service } from '../data/types'
import { copy } from '../data/copy'
import { PriceTag } from './PriceTag'
import { WhatsAppButton } from './WhatsAppButton'

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

function CrossIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-text-muted"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.3 4.3a1 1 0 011.4 0L10 8.6l4.3-4.3a1 1 0 111.4 1.4L11.4 10l4.3 4.3a1 1 0 01-1.4 1.4L10 11.4l-4.3 4.3a1 1 0 01-1.4-1.4L8.6 10 4.3 5.7a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/** Tarjeta de servicio: para quién es, qué incluye, qué no, plazo y precio. */
export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow sm:p-8">
      <h3 className="font-display text-2xl font-semibold text-text">{service.name}</h3>
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
            {copy.services.excludesLabel}
          </p>
          <ul className="space-y-2">
            {service.excludes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-muted">
                <CrossIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">
            {copy.services.timelineLabel}: {service.timeline}
          </span>
          <PriceTag label={copy.services.priceFromLabel} price={service.priceFrom} />
        </div>
      </div>

      <div className="mt-auto">
        <WhatsAppButton serviceId={service.id} label={copy.services.ctaLabel} className="w-full" />
      </div>
    </article>
  )
}