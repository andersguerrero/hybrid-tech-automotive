import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description: 'Read customer reviews and testimonials about Hybrid Tech Auto hybrid battery replacement and automotive services in Spring, TX.',
  openGraph: {
    title: 'Customer Reviews | Hybrid Tech Auto',
    description: 'What our customers say about Hybrid Tech Auto services.',
    images: [{ url: '/logo.jpg', width: 600, height: 300, alt: 'Hybrid Tech Auto Reviews' }],
  },
  twitter: {
    card: 'summary',
    title: 'Customer Reviews | Hybrid Tech Auto',
    description: 'Read customer reviews about Hybrid Tech Auto services.',
  },
  alternates: { canonical: '/reviews' },
}

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
