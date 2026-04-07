import React from 'react'
import { CartProvider } from '@/contexts/CartContext'

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
}

// Mock LanguageProvider that does not depend on localStorage/window effects
function MockLanguageProvider({ children, locale = 'en' }: { children: React.ReactNode; locale?: 'en' | 'es' }) {
  const { translations } = require('@/i18n/translations')
  const t = translations[locale]

  const value = {
    locale,
    setLocale: jest.fn(),
    t,
  }

  const { createContext, useContext } = require('react')

  // We re-export a simple provider so components using useLanguage work
  return (
    <LanguageCtx.Provider value={value}>
      {children}
    </LanguageCtx.Provider>
  )
}

// Create a context that matches the shape useLanguage expects
const React2 = require('react')
const LanguageCtx = React2.createContext<any>(undefined)

// Provide all required wrappers for rendering components
export function AllProviders({ children, locale = 'en' }: { children: React.ReactNode; locale?: 'en' | 'es' }) {
  return (
    <MockLanguageProvider locale={locale}>
      <CartProvider>
        {children}
      </CartProvider>
    </MockLanguageProvider>
  )
}

export { MockLanguageProvider, LanguageCtx }
