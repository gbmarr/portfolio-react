import { WhatsAppButton } from '../components/WhatsAppButton'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { copy } from '../data/copy'

/** CTA final repetido, que cierra el home. */
export function CTAFinal() {
  return (
    <Section id="presupuesto" className="bg-surface/40">
      <Container className="max-w-3xl text-center">
        <h2 className="font-display text-3xl font-semibold text-text sm:text-4xl">
          {copy.cta.title}
        </h2>
        <p className="mt-5 text-lg text-text-muted">{copy.cta.subtitle}</p>
        <div className="mt-9">
          <WhatsAppButton label={copy.cta.button} className="px-10 py-4 text-lg" />
        </div>
      </Container>
    </Section>
  )
}