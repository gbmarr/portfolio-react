import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ServiceCard } from '../components/ServiceCard'
import { copy } from '../data/copy'
import { services } from '../data/services'

/** Resumen de servicios: dos opciones claras, con plazo y precio visible. */
export function ServicesPreview() {
  return (
    <Section id="servicios">
      <Container>
        <SectionHeading eyebrow={copy.services.eyebrow} title={copy.services.title} subtitle={copy.services.subtitle} />
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button href="#servicios-detalle" variant="secondary">
            {copy.services.detailLabel}
          </Button>
        </div>
      </Container>
    </Section>
  )
}