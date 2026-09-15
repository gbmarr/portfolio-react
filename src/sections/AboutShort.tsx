import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'

/** Sobre mí corto: 3-4 líneas + foto real, trato directo como ventaja. */
export function AboutShort() {
  return (
    <Section id="sobre-mi" className="bg-surface/40">
      <Container className="max-w-3xl">
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
      </Container>
    </Section>
  )
}