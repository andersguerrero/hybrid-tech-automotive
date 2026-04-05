import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Warranty Policy',
  description: 'Hybrid Tech Auto warranty policy for hybrid battery replacements and automotive services.',
  alternates: { canonical: '/warranty' },
}

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
