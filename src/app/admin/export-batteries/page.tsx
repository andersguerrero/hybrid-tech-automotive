'use client'

import { useState, useEffect } from 'react'
import { Download, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ExportBatteriesPage() {
  const [batteries, setBatteries] = useState<any[]>([])
  const [exported, setExported] = useState(false)
  const [imported, setImported] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Cargar baterías desde localStorage
    const saved = localStorage.getItem('admin_batteries')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBatteries(parsed)
      } catch (e) {
        setError('Error al leer las baterías desde localStorage')
      }
    } else {
      setError('No hay baterías guardadas en localStorage')
    }
  }, [])

  const handleExport = () => {
    if (batteries.length === 0) {
      setError('No hay baterías para exportar')
      return
    }

    const dataStr = JSON.stringify(batteries, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batteries-export-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      setLoading(true)
      setError('')

      try {
        const text = await file.text()
        const importedBatteries = JSON.parse(text)

        if (!Array.isArray(importedBatteries)) {
          throw new Error('El archivo no contiene un array de baterías')
        }

        // Guardar en localStorage
        localStorage.setItem('admin_batteries', JSON.stringify(importedBatteries))
        localStorage.setItem('batteries_edited_by_admin', 'true')

        // Guardar en el servidor
        const response = await fetch('/api/batteries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batteries: importedBatteries }),
        })

        const data = await response.json()

        if (data.success) {
          setBatteries(importedBatteries)
          setImported(true)
          setTimeout(() => setImported(false), 3000)
          
          // Disparar evento para actualizar otros componentes
          window.dispatchEvent(new CustomEvent('batteriesUpdated'))
        } else {
          throw new Error(data.error || 'Error al guardar en el servidor')
        }
      } catch (err: any) {
        setError(err.message || 'Error al importar las baterías')
      } finally {
        setLoading(false)
      }
    }
    input.click()
  }

  const handleSyncToServer = async () => {
    if (batteries.length === 0) {
      setError('No hay baterías para sincronizar')
      return
    }

    setLoading(true)
    setError('')
    setImported(false)

    try {
      // Primero sincronizar a producción
      const productionUrl = 'https://hybrid-tech-automotive.vercel.app'
      const prodResponse = await fetch(`${productionUrl}/api/batteries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batteries }),
      })

      const prodData = await prodResponse.json()

      if (!prodData.success) {
        throw new Error(prodData.error || 'Error al sincronizar a producción')
      }

      // También guardar localmente
      const localResponse = await fetch('/api/batteries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batteries }),
      })

      const localData = await localResponse.json()

      if (localData.success || prodData.success) {
        setImported(true)
        setError('')
        setTimeout(() => setImported(false), 5000)
        window.dispatchEvent(new CustomEvent('batteriesUpdated'))
        
        // Verificar que se guardó correctamente
        setTimeout(async () => {
          const verifyResponse = await fetch(`${productionUrl}/api/batteries`)
          const verifyData = await verifyResponse.json()
          if (verifyData.success && verifyData.batteries) {
            console.log('✅ Verificación: Baterías en producción:', verifyData.batteries.length)
          }
        }, 2000)
      } else {
        throw new Error(localData.error || 'Error al sincronizar localmente')
      }
    } catch (err: any) {
      setError(err.message || 'Error al sincronizar con el servidor')
      setImported(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>
          <h1 className="text-4xl font-bold mb-2">Exportar/Importar Baterías</h1>
          <p className="text-xl text-blue-100">
            Sincroniza tus baterías entre localhost y producción
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card space-y-6">
            {/* Estado actual */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Estado Actual</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Baterías en localStorage:</strong> {batteries.length}
                </p>
                {batteries.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Última actualización: {new Date().toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Mensajes */}
            {exported && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Baterías exportadas correctamente</span>
              </div>
            )}

            {imported && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Baterías importadas y guardadas correctamente</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Acciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleExport}
                disabled={batteries.length === 0}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>Exportar JSON</span>
              </button>

              <button
                onClick={handleImport}
                disabled={loading}
                className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>{loading ? 'Importando...' : 'Importar JSON'}</span>
              </button>

              <button
                onClick={handleSyncToServer}
                disabled={loading || batteries.length === 0}
                className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? 'Sincronizando...' : 'Sincronizar al Servidor'}</span>
              </button>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Instrucciones:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                <li>Desde localhost: Haz clic en "Exportar JSON" para descargar tus baterías</li>
                <li>En producción: Ve a esta misma página y haz clic en "Importar JSON"</li>
                <li>O simplemente haz clic en "Sincronizar al Servidor" para guardar las baterías actuales</li>
              </ol>
            </div>

            {/* Vista previa */}
            {batteries.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Vista Previa (primeras 3 baterías):</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-700">
                    {JSON.stringify(batteries.slice(0, 3), null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
