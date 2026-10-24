import { CaseCard } from '../components/CaseCard'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'
import { cases } from '../data/cases'

/** Todos los casos con contexto y la nota de honestidad. Nunca una galería. */
export function Cases() {
  return (
    <Section id="trabajos" className="bg-surface/40">
      <Container>
        <SectionHeading
          eyebrow={copy.cases.eyebrow}
          title={copy.cases.title}
          subtitle={copy.cases.subtitle}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseStudy, index) => (
            <Reveal key={caseStudy.id} delay={(index % 3) * 60} className="h-full">
              <CaseCard caseStudy={caseStudy} />
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-text-muted">
          {copy.cases.honestyNote}
        </p>
      </Container>
    </Section>
  )
}
