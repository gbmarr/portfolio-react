import { Link } from 'react-router-dom'
import { copy } from '../data/copy'

interface LegalConsentProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Consentimiento informado reutilizable en los formularios públicos. */
export function LegalConsent({ id, checked, onChange }: LegalConsentProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-border bg-surface text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-text-muted">
          {copy.legal.consent}
        </label>
      </div>
      <p className="pl-7 text-sm">
        <Link to="/privacidad" className="text-accent underline underline-offset-2 hover:text-accent/80">
          {copy.legal.privacy}
        </Link>
        <span className="mx-2 text-text-muted" aria-hidden="true">
          ·
        </span>
        <Link to="/terminos" className="text-accent underline underline-offset-2 hover:text-accent/80">
          {copy.legal.terms}
        </Link>
      </p>
    </div>
  )
}
