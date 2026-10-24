import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'

/** Sobre mí corto: trato directo, prueba verificable y seguimiento en panel. */
export function AboutShort() {
  return (
    <Section id="sobre-mi">
      <Container className="max-w-4xl">
        <SectionHeading eyebrow={copy.about.eyebrow} title={copy.about.title} />
        <div className="grid items-center gap-10 sm:grid-cols-[auto_1fr]">
          <img
            src="/images/profile-photo.webp"
            alt={copy.about.photoAlt}
            className="mx-auto h-36 w-36 rounded-full border-2 border-accent/40 object-cover shadow-glow"
          />
          <p className="text-center leading-relaxed text-text-muted sm:text-left sm:text-lg">
            {copy.about.text}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              {copy.about.proofLabel}
            </p>
            <p className="text-sm leading-relaxed text-text-muted">{copy.about.proof}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              {copy.about.portalLabel}
            </p>
            <p className="text-sm leading-relaxed text-text-muted">{copy.about.portal}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">{copy.about.conditions}</p>
      </Container>
    </Section>
  )
}
