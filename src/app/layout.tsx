import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LanguageProviderWrapper from '@/providers/LanguageProviderWrapper'
import CartProviderWrapper from '@/providers/CartProviderWrapper'
import ThemeProviderWrapper from '@/providers/ThemeProviderWrapper'
import { LocalBusinessJsonLd } from '@/components/JsonLd'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://hybridtechauto.com'),
  title: {
    default: 'Hybrid Tech Auto - Hybrid Battery Replacement & Car Services',
    template: '%s | Hybrid Tech Auto',
  },
  description: 'Professional hybrid battery replacement and car services in Spring, TX. Transparent pricing, online booking, and expert repairs for Toyota, Lexus, and other hybrid vehicles.',
  keywords: 'hybrid battery replacement, car services, Toyota Prius, Lexus hybrid, brake service, suspension repair, Spring TX',
  authors: [{ name: 'Hybrid Tech Automotive LLC' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Hybrid Tech Auto - Expert Hybrid Services',
    description: 'Professional hybrid battery replacement and car services with transparent pricing and online booking.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Hybrid Tech Auto',
    images: [{ url: '/logo.jpg', width: 600, height: 300, alt: 'Hybrid Tech Auto Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hybrid Tech Auto - Expert Hybrid Services',
    description: 'Professional hybrid battery replacement and car services in Spring, TX.',
    images: ['/logo.jpg'],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'HybridTech',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#007BFF" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>
        <LocalBusinessJsonLd />
        <ThemeProviderWrapper>
          <LanguageProviderWrapper>
            <CartProviderWrapper>
              <Header />
              <main id="main-content" className="min-h-screen">
                {children}
              </main>
              <Footer />
              <WhatsAppButton />
            </CartProviderWrapper>
          </LanguageProviderWrapper>
        </ThemeProviderWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}