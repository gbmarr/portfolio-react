import type { ExperienceItem } from '../data/types'

interface TimelineProps {
  title: string
  items: ExperienceItem[]
}

export function Timeline({ title, items }: TimelineProps) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="mb-6 font-display text-xl font-semibold text-text">{title}</h3>
      <ol>
        {items.map((item) => (
          <li
            key={`${item.title}-${item.organization}`}
            className="relative border-l border-border pb-8 pl-6 last:pb-0"
          >
            <span aria-hidden="true" className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-accent" />
            <h4 className="font-display text-lg font-semibold text-text">{item.title}</h4>
            <p className="text-sm font-medium text-accent">{item.organization}</p>
            <p className="mt-1 text-sm text-text-muted">
              {item.startDate} — {item.endDate ?? 'Presente'}
            </p>
            {item.achievements.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-text-muted">
                {item.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
