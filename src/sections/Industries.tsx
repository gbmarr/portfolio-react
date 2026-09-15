import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'
import { industries } from '../data/industries'

/**
 * Rubros/industries para que el visitante se sienta identificado.
 * Ubicada después de Beneficios, con fondo tinte para alternar el ritmo visual.
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
      </Container>
    </Section>
  )
}
