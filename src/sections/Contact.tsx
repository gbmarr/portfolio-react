import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { profile } from '../data/profile'

export function Contact() {
  const { email, socialLinks } = profile

  return (
    <Section id="contacto">
      <Container>
        <SectionHeading
          eyebrow="Contacto"
          title="¿Hablamos?"
          subtitle="Si tienes una oportunidad o proyecto en mente, escríbeme."
        />
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href={`mailto:${email}`}>Enviar email</Button>
          <Button href={socialLinks.github} variant="secondary">
            GitHub
          </Button>
          <Button href={socialLinks.linkedin} variant="secondary">
            LinkedIn
          </Button>
          {socialLinks.others?.map((other) => (
            <Button key={other.url} href={other.url} variant="secondary">
              {other.label}
            </Button>
          ))}
        </div>
      </Container>
    </Section>
  )
}
