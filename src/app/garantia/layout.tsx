import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garantia',
  description: 'Politica de garantia de Hybrid Tech Auto para reemplazos de baterias hibridas y servicios automotrices.',
  alternates: { canonical: '/warranty' },
}

export default function GarantiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
