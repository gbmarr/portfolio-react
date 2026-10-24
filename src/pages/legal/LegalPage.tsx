import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/Container'
import { Footer } from '../../components/Footer'
import { Section } from '../../components/Section'
import { copy } from '../../data/copy'
import { applySeoMeta } from '../../utils/seo'

interface LegalPageProps {
  title: string
  description: string
  children: ReactNode
}

/** Layout de las páginas legales públicas: sin navbar de landing ni panel. */
export function LegalPage({ title, description, children }: LegalPageProps) {
  useEffect(() => {
    applySeoMeta({
      title: `${title} | ${copy.seo.siteName}`,
      description,
      locale: copy.seo.locale,
      siteName: copy.seo.siteName,
    })
  }, [title, description])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <main className="flex-1">
        <Section>
          <Container className="max-w-3xl">
            <Link
              to="/"
              className="text-sm text-text-muted underline-offset-4 transition-colors hover-fine:text-accent hover-fine:underline"
            >
              ← {copy.legal.backHome}
            </Link>
            <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-text-muted">{copy.legal.lastUpdated}</p>
            <div className="mt-8 space-y-4 text-sm leading-relaxed text-text-muted [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text [&_li]:mt-2 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2">
              {children}
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  )
}
