import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { IndustryChip } from '../components/IndustryChip'
import { copy } from '../data/copy'
import { industries } from '../data/industries'

/**
 * Rubros/industries para que el visitante se sienta identificado.
 * Ubicada después de Beneficios, con fondo tinte para alternar el ritmo visual.
 * Cada chip muestra en hover/foco/tap el beneficio particular de su rubro.
 */
export function Industries() {
  return (
    <Section id="rubros" className="bg-surface/40">
      <Container>
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
                  <li key={item.name}>
                    <IndustryChip item={item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
