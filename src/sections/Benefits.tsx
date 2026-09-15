import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { BenefitCard } from '../components/BenefitCard'
import { copy } from '../data/copy'
import { benefits } from '../data/benefits'
import { industries } from '../data/industries'

/**
 * Beneficios de tener un sitio web + listado de rubros para que el visitante
 * se sienta identificado. Ubicada entre "Problema" y "Servicios".
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

        <div className="mt-20">
          <SectionHeading
            eyebrow={copy.industries.eyebrow}
            title={copy.industries.title}
            subtitle={copy.industries.subtitle}
          />
          <div className="mx-auto max-w-4xl space-y-8">
            {industries.map((group) => (
              <div key={group.id}>
                <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-text-muted">
                  {group.label}
                </h3>
                <ul className="flex flex-wrap justify-center gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-muted transition-colors hover:border-accent/40 hover:text-text"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
