import type { FAQ } from '../data/types'

interface FAQProps {
  items: FAQ[]
}

/** Acordeón de preguntas frecuentes. */
export function FAQ({ items }: FAQProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-xl border border-border bg-surface px-6 py-5 transition-colors open:border-accent/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <span className="font-display text-lg font-semibold text-text">
              {item.question}
            </span>
            <span
              aria-hidden="true"
              className="text-2xl font-light text-accent transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}