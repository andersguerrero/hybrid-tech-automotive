'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui', padding: '2rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto', background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Error del servidor</h1>
          <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Detalle del error:</p>
          <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.375rem', fontSize: '0.875rem', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.message}
          </pre>
          <button
            onClick={reset}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
