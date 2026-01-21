import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LanguageProviderWrapper from '@/providers/LanguageProviderWrapper'
import CartProviderWrapper from '@/providers/CartProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hybrid Tech Auto - Hybrid Battery Replacement & Car Services',
  description: 'Professional hybrid battery replacement and car services. Transparent pricing, online booking, and expert repairs for Toyota, Lexus, and other hybrid vehicles.',
  keywords: 'hybrid battery replacement, car services, Toyota Prius, Lexus hybrid, brake service, suspension repair',
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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProviderWrapper>
          <CartProviderWrapper>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProviderWrapper>
        </LanguageProviderWrapper>
      </body>
    </html>
  )
}