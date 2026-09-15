import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BenefitCard } from '../components/BenefitCard'
import { copy } from '../data/copy'
import { benefits } from '../data/benefits'

/**
 * Beneficios de tener un sitio web para tu negocio.
 * Ubicada entre Problema e Industries (rubros).
 */
export function Benefits() {
  return (
    <Section id="beneficios">
      <Container>
        <SectionHeading
          eyebrow={copy.benefits.eyebrow}
          title={copy.benefits.title}
          subtitle={copy.benefits.subtitle}
        />
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </div>
      </Container>
    </Section>
  )
}
