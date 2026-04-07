import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LanguageProviderWrapper from '@/providers/LanguageProviderWrapper'
import CartProviderWrapper from '@/providers/CartProviderWrapper'
import ThemeProviderWrapper from '@/providers/ThemeProviderWrapper'
import { LocalBusinessJsonLd } from '@/components/JsonLd'
import WhatsAppButton from '@/components/WhatsAppButton'
import TawkTo from '@/components/TawkTo'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { blobGet } from '@/lib/storage'
import { siteImages as defaultSiteImages } from '@/data/images'
import type { SiteImages } from '@/data/images'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

export async function generateMetadata(): Promise<Metadata> {
  let siteImages = defaultSiteImages
  try {
    siteImages = await blobGet<SiteImages>('config/site-images.json', 'site-images-custom.json', defaultSiteImages)
  } catch { /* use defaults */ }

  const logoUrl = siteImages.logo || '/logo.jpg'

  return {
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
      apple: logoUrl,
    },
    openGraph: {
      title: 'Hybrid Tech Auto - Expert Hybrid Services',
      description: 'Professional hybrid battery replacement and car services with transparent pricing and online booking.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Hybrid Tech Auto',
      images: [{ url: logoUrl, width: 600, height: 300, alt: 'Hybrid Tech Auto Logo' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hybrid Tech Auto - Expert Hybrid Services',
      description: 'Professional hybrid battery replacement and car services in Spring, TX.',
      images: [logoUrl],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1F2937" />
      </head>
      <body className={inter.className}>
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
        <TawkTo />
        <Analytics />
        <SpeedInsights />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`
        }} />
      </body>
    </html>
  )
}