'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SyncNowPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [batteriesCount, setBatteriesCount] = useState(0)

  useEffect(() => {
    // Sincronizar automáticamente al cargar la página
    syncBatteries()
  }, [])

  const syncBatteries = async () => {
    setStatus('loading')
    setMessage('Leyendo baterías desde localStorage...')

    try {
      // Leer baterías desde localStorage
      const saved = localStorage.getItem('admin_batteries')
      
      if (!saved) {
        setStatus('error')
        setMessage('No hay baterías guardadas en localStorage. Por favor, guarda algunas baterías primero en /admin/batteries')
        return
      }

      const batteries = JSON.parse(saved)
      setBatteriesCount(batteries.length)

      if (batteries.length === 0) {
        setStatus('error')
        setMessage('No hay baterías para sincronizar')
        return
      }

      setMessage(`Sincronizando ${batteries.length} baterías a producción...`)

      // Enviar a producción
      const response = await fetch('https://hybrid-tech-automotive.vercel.app/api/batteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batteries }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(`¡Éxito! ${batteries.length} baterías sincronizadas a producción.`)
        
        // Disparar evento para actualizar
        window.dispatchEvent(new CustomEvent('batteriesUpdated'))
        
        // Abrir producción en nueva pestaña para que también se guarden allí
        const prodUrl = `https://hybrid-tech-automotive.vercel.app/admin/import-batteries?data=${encodeURIComponent(JSON.stringify(batteries))}`
        window.open(prodUrl, '_blank')
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          window.location.href = '/admin/batteries'
        }, 3000)
      } else {
        throw new Error(data.error || 'Error al sincronizar')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container-custom max-w-2xl">
        <div className="card text-center">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-primary-500 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>

          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Sincronizando...</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-700">¡Sincronización Exitosa!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirigiendo al panel de baterías...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-700">Error de Sincronización</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <Link href="/admin/batteries" className="btn-primary inline-block">
                  Ir a Baterías
                </Link>
                <button onClick={syncBatteries} className="btn-secondary ml-2">
                  Reintentar
                </button>
              </div>
            </>
          )}

          {status === 'idle' && (
            <>
              <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Preparando sincronización...</h1>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
