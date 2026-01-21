'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function ImportBatteriesPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [batteriesCount, setBatteriesCount] = useState(0)

  useEffect(() => {
    const dataParam = searchParams.get('data')
    
    if (!dataParam) {
      setStatus('error')
      setMessage('No se recibieron datos para importar')
      return
    }

    try {
      const batteries = JSON.parse(decodeURIComponent(dataParam))
      
      if (!Array.isArray(batteries) || batteries.length === 0) {
        throw new Error('Datos inválidos')
      }

      setBatteriesCount(batteries.length)
      
      // Guardar en localStorage
      localStorage.setItem('admin_batteries', JSON.stringify(batteries))
      localStorage.setItem('batteries_edited_by_admin', 'true')
      
      // También guardar en el servidor
      fetch('/api/batteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batteries }),
      }).then(() => {
        setStatus('success')
        setMessage(`¡${batteries.length} baterías importadas correctamente!`)
        
        // Disparar evento para actualizar
        window.dispatchEvent(new CustomEvent('batteriesUpdated'))
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = '/batteries'
        }, 2000)
      }).catch(error => {
        setStatus('error')
        setMessage(`Error al guardar en servidor: ${error.message}`)
      })
      
    } catch (error: any) {
      setStatus('error')
      setMessage(`Error al importar: ${error.message}`)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container-custom max-w-2xl">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Importando baterías...</h1>
              <p className="text-gray-600">Por favor espera...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-green-700">¡Importación Exitosa!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirigiendo a la página de baterías...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-700">Error de Importación</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <a href="/batteries" className="btn-primary inline-block">
                Ir a Baterías
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
