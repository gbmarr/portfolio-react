import { Container } from './Container'
import { copy } from '../data/copy'
import { profile } from '../data/profile'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-text-muted">{copy.footer.tagline}</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {/* Anclas simples (sin Link) para no requerir contexto de router. */}
          <a
            href="/privacidad"
            className="text-xs text-text-muted underline-offset-4 transition-colors hover-fine:text-accent hover-fine:underline"
          >
            {copy.legal.privacy}
          </a>
          <a
            href="/terminos"
            className="text-xs text-text-muted underline-offset-4 transition-colors hover-fine:text-accent hover-fine:underline"
          >
            {copy.legal.terms}
          </a>
          <a
            href="/login"
            className="text-xs text-text-muted underline-offset-4 transition-colors hover-fine:text-accent hover-fine:underline"
          >
            {copy.footer.clientAccess}
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-text-muted">
          © {year} {profile.name}. {copy.footer.rights}
        </p>
      </Container>
    </footer>
  )
}
