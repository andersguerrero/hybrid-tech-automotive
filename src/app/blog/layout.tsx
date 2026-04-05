import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Expert tips, guides, and news about hybrid vehicles, battery maintenance, and automotive care from Hybrid Tech Auto in Spring, TX.',
  openGraph: {
    title: 'Blog | Hybrid Tech Auto',
    description: 'Expert tips and guides about hybrid vehicles and battery maintenance.',
    images: [{ url: '/logo.jpg', width: 600, height: 300, alt: 'Hybrid Tech Auto Blog' }],
  },
  twitter: {
    card: 'summary',
    title: 'Blog | Hybrid Tech Auto',
    description: 'Expert tips and guides about hybrid vehicles and battery maintenance.',
  },
  alternates: { canonical: '/blog' },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
