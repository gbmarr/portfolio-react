import { useLanguage } from '../i18n/LanguageContext'

const languageOptions = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
] as const

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      className="flex items-center gap-1 rounded-full border border-border bg-background/60 p-1"
    >
      {languageOptions.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLanguage(option.code)}
          aria-pressed={language === option.code}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
            language === option.code
              ? 'bg-accent text-background'
              : 'text-text-muted hover:text-text'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
