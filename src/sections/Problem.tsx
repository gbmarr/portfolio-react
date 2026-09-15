import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { copy } from '../data/copy'

/** El problema del visitante, en 2-3 líneas. */
export function Problem() {
  return (
    <Section id="problema" className="bg-surface/40">
      <Container className="max-w-3xl text-center">
        <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
          {copy.problem.title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-muted">{copy.problem.text}</p>
      </Container>
    </Section>
  )
}