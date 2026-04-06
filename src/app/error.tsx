'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Algo salió mal</h1>
        <p className="text-gray-600 mb-4">
          Se ha producido un error en la aplicación. Detalles:
        </p>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-left overflow-auto max-h-48 mb-6 break-all">
          {error.message}
        </pre>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
