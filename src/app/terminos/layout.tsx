import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terminos de Servicio',
  description: 'Terminos de servicio de Hybrid Tech Auto.',
  alternates: { canonical: '/terms' },
}

export default function TerminosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
