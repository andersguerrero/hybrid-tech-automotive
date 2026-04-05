import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politica de Privacidad',
  description: 'Politica de privacidad de Hybrid Tech Auto.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
