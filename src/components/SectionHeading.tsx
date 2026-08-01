interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
}

export function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12 text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-text-muted">{subtitle}</p> : null}
    </div>
  )
}
