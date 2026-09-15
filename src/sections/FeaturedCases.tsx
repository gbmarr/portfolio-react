import { Button } from '../components/Button'
import { CaseCard } from '../components/CaseCard'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { copy } from '../data/copy'
import { cases } from '../data/cases'

/** Trabajos resumido: 2-3 casos con contexto, nunca una galería. */
export function FeaturedCases() {
  const featured = cases.slice(0, 3)

  return (
    <Section id="trabajos">
      <Container>
        <SectionHeading eyebrow={copy.cases.eyebrow} title={copy.cases.title} subtitle={copy.cases.subtitle} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((caseStudy) => (
            <CaseCard key={caseStudy.id} caseStudy={caseStudy} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button href="#trabajos-detalle" variant="secondary">
            {copy.cases.viewAll}
          </Button>
        </div>
      </Container>
    </Section>
  )
}