import { ContactForm } from '../components/ContactForm'
import { Container } from '../components/Container'
import { Section } from '../components/Section'
import { SectionHeading } from '../components/SectionHeading'
import { WhatsAppButton } from '../components/WhatsAppButton'
import { copy } from '../data/copy'
import { profile } from '../data/profile'

/** Contacto: formulario corto + WhatsApp, con expectativa de respuesta. */
export function Contact() {
  return (
    <Section id="contacto">
      <Container className="max-w-4xl">
        <SectionHeading
          eyebrow={copy.contact.eyebrow}
          title={copy.contact.title}
          subtitle={copy.contact.subtitle}
        />
        <div className="grid gap-10 md:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-5">
            <p className="text-text-muted">{copy.contact.responseTime}</p>
            <WhatsAppButton className="w-full" />
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 font-semibold text-text transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              {copy.contact.sendEmail}
            </a>
          </div>
          <ContactForm />
        </div>
      </Container>
    </Section>
  )
}