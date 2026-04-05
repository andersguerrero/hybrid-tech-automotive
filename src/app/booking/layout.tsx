import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Schedule your hybrid battery replacement or automotive service appointment online with Hybrid Tech Auto in Spring, TX.',
  openGraph: {
    title: 'Book an Appointment | Hybrid Tech Auto',
    description: 'Schedule your automotive service appointment online.',
  },
  alternates: { canonical: '/booking' },
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
