import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LanguageProviderWrapper from '@/providers/LanguageProviderWrapper'
import CartProviderWrapper from '@/providers/CartProviderWrapper'
import { LocalBusinessJsonLd } from '@/components/JsonLd'
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
  },
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LocalBusinessJsonLd />
        <LanguageProviderWrapper>
          <CartProviderWrapper>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProviderWrapper>
        </LanguageProviderWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}