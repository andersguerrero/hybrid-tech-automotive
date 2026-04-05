import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hybrid Batteries',
  description: 'New and rebuilt hybrid batteries for Toyota Prius, Camry, Highlander, Corolla, and Lexus vehicles. Competitive pricing with warranty coverage in Spring, TX.',
  openGraph: {
    title: 'Hybrid Batteries | Hybrid Tech Auto',
    description: 'New and rebuilt hybrid batteries for Toyota and Lexus vehicles with warranty coverage.',
    images: [{ url: '/logo.jpg', width: 600, height: 300, alt: 'Hybrid Tech Auto Batteries' }],
  },
  twitter: {
    card: 'summary',
    title: 'Hybrid Batteries | Hybrid Tech Auto',
    description: 'New and rebuilt hybrid batteries for Toyota and Lexus with warranty.',
  },
  alternates: { canonical: '/batteries' },
}

export default function BatteriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
