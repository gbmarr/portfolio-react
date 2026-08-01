import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations, type Language, type Translation } from './translations'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
}

// Default to Spanish so components can render safely without a provider
// (useful for isolated tests and partial trees).
const defaultContext: LanguageContextValue = {
  language: 'es',
  setLanguage: () => {},
  t: translations['es'],
}

const LanguageContext = createContext<LanguageContextValue>(defaultContext)

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
    return 'es'
  }
  const browserLanguage = window.navigator.language.toLowerCase()
  return browserLanguage.startsWith('en') ? 'en' : 'es'
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(getBrowserLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext)
}
