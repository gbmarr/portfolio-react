import { Container } from './Container'
import { copy } from '../data/copy'
import { profile } from '../data/profile'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-8">
      <Container>
        <p className="text-center text-sm text-text-muted">{copy.footer.tagline}</p>
        <p className="mt-2 text-center">
          {/* Ancla simple (sin Link) para no requerir contexto de router. */}
          <a
            href="/login"
            className="text-xs text-text-muted/70 underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            {copy.footer.clientAccess}
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-text-muted/70">
          © {year} {profile.name}. {copy.footer.rights}
        </p>
      </Container>
    </footer>
  )
}