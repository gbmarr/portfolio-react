import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { FAQ } from '../components/FAQ'
import { copy } from '../data/copy'
import { faqs } from '../data/faq'

/** Preguntas frecuentes: el acordeón del home. */
export function FAQSection() {
  return (
    <Section id="preguntas">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow={copy.faq.eyebrow} title={copy.faq.title} subtitle={copy.faq.subtitle} />
        <FAQ items={faqs} />
      </Container>
    </Section>
  )
}