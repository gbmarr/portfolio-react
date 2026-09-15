import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { ProcessSteps } from '../components/ProcessSteps'
import { copy } from '../data/copy'
import { processSteps } from '../data/process'

/** Cómo trabajo: pasos numerados. */
export function HowItWorks() {
  return (
    <Section id="como-trabajo" className="bg-surface/40">
      <Container>
        <SectionHeading eyebrow={copy.process.eyebrow} title={copy.process.title} subtitle={copy.process.subtitle} />
        <ProcessSteps steps={processSteps} />
      </Container>
    </Section>
  )
}