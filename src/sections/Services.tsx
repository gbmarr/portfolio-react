import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { copy } from '../data/copy'
import { services } from '../data/services'

/** Servicios completos: las dos opciones con incluye/no incluye, plazo, precio y CTA. */
export function Services() {
  return (
    <Section id="servicios">
      <Container>
        <SectionHeading
          eyebrow={copy.services.eyebrow}
          title={copy.services.title}
          subtitle={copy.services.subtitle}
        />
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="mb-6 text-text-muted">{copy.services.unsureText}</p>
          <WhatsAppButton label={copy.services.ctaLabel} />
        </div>
      </Container>
    </Section>
  )
}