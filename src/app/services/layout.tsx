import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Automotive Services',
  description: 'Professional hybrid and automotive services including suspension inspection, brake replacement, coolant flush, transmission service, and hybrid battery diagnostics in Spring, TX.',
  openGraph: {
    title: 'Automotive Services | Hybrid Tech Auto',
    description: 'Expert automotive services with transparent pricing. Suspension, brakes, coolant, transmission, and hybrid battery diagnostics.',
  },
  alternates: { canonical: '/services' },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
