'use client'

import dynamic from 'next/dynamic'

const HomeContent = dynamic(() => import('./HomeContent'), {
  ssr: true,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return <HomeContent />
}
