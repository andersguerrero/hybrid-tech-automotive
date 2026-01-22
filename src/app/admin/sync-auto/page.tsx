'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SyncAutoPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [batteriesCount, setBatteriesCount] = useState(0)

  useEffect(() => {
    const syncBatteries = async () => {
      try {
        setMessage('Leyendo baterías desde localStorage...')
        
        // Leer desde localStorage
        const saved = localStorage.getItem('admin_batteries')
        if (!saved) {
          throw new Error('No hay baterías guardadas en localStorage')
        }

        const batteries = JSON.parse(saved)
        setBatteriesCount(batteries.length)
        setMessage(`Encontradas ${batteries.length} baterías. Sincronizando a producción...`)

        // Enviar a producción
        const productionUrl = 'https://hybrid-tech-automotive.vercel.app'
        const response = await fetch(`${productionUrl}/api/batteries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batteries }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage(`✅ ${batteries.length} baterías sincronizadas correctamente a producción!`)
          
          // También guardar localmente
          localStorage.setItem('admin_batteries', JSON.stringify(batteries))
          localStorage.setItem('batteries_edited_by_admin', 'true')
          window.dispatchEvent(new CustomEvent('batteriesUpdated'))
          
          // Verificar después de 2 segundos
          setTimeout(async () => {
            const verifyResponse = await fetch(`${productionUrl}/api/batteries`)
            const verifyData = await verifyResponse.json()
            if (verifyData.success && verifyData.batteries) {
              console.log('✅ Verificación: Baterías en producción:', verifyData.batteries.length)
            }
          }, 2000)
        } else {
          throw new Error(data.error || 'Error al sincronizar')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(`❌ Error: ${error.message}`)
      }
    }

    syncBatteries()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>
          <h1 className="text-4xl font-bold mb-2">Sincronización Automática</h1>
          <p className="text-xl text-blue-100">
            Sincronizando baterías a producción...
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <div className="card">
            {status === 'loading' && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-700">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Sincronización Exitosa!</h2>
                <p className="text-gray-700 mb-4">{message}</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>{batteriesCount} baterías</strong> ahora están disponibles en producción.
                  </p>
                </div>
                <div className="space-y-2">
                  <a
                    href="https://hybrid-tech-automotive.vercel.app/batteries"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-block"
                  >
                    Ver Baterías en Producción
                  </a>
                  <Link href="/admin" className="btn-outline block text-center">
                    Volver al Panel
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error en la Sincronización</h2>
                <p className="text-gray-700 mb-4">{message}</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn-primary"
                  >
                    Intentar Nuevamente
                  </button>
                  <Link href="/admin/export-batteries" className="btn-outline block text-center">
                    Usar Exportación Manual
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
