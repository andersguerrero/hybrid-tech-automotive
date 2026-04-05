import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Hybrid Tech Auto in Spring, TX. Call (832) 762-5299 or visit us at 24422 Starview Landing Ct, Spring, TX 77373.',
  openGraph: {
    title: 'Contact Us | Hybrid Tech Auto',
    description: 'Get in touch with Hybrid Tech Auto for hybrid battery replacement and automotive services.',
  },
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
