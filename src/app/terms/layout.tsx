import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Hybrid Tech Auto.',
  alternates: { canonical: '/terms' },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
