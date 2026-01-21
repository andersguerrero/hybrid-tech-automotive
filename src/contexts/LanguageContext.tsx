'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Locale } from '@/i18n/translations'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [translationsState, setTranslationsState] = useState(translations)

  useEffect(() => {
    // Load language from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'es')) {
      setLocaleState(savedLocale)
    }

    // Load custom translations from localStorage
    const loadCustomTranslations = () => {
      const customEn = localStorage.getItem('admin_translations_en')
      const customEs = localStorage.getItem('admin_translations_es')
      
      setTranslationsState({
        en: customEn ? JSON.parse(customEn) : translations.en,
        es: customEs ? JSON.parse(customEs) : translations.es
      })
    }

    loadCustomTranslations()

    // Listen for storage changes
    window.addEventListener('storage', loadCustomTranslations)
    window.addEventListener('customTranslationUpdate', loadCustomTranslations)

    return () => {
      window.removeEventListener('storage', loadCustomTranslations)
      window.removeEventListener('customTranslationUpdate', loadCustomTranslations)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: translationsState[locale]
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
