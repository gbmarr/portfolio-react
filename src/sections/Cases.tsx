import { CaseCard } from '../components/CaseCard'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'
import { cases } from '../data/cases'

/** Todos los casos con contexto y la nota de honestidad. Nunca una galería. */
export function Cases() {
  return (
    <Section id="trabajos">
      <Container>
        <SectionHeading
          eyebrow={copy.cases.eyebrow}
          title={copy.cases.title}
          subtitle={copy.cases.subtitle}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseStudy) => (
            <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-text-muted">
          {copy.cases.honestyNote}
        </p>
      </Container>
    </Section>
  )
}