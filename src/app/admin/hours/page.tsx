'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Clock, ArrowLeft } from 'lucide-react'
import { businessHours as initialHours } from '@/data'

export default function HoursAdminPage() {
  const [hoursData, setHoursData] = useState(initialHours)
  const [savedMessage, setSavedMessage] = useState<string>('')

  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await fetch('/api/hours')
        const data = await response.json()
        if (data.success && data.hours) {
          setHoursData(data.hours)
          localStorage.setItem('admin_hours', JSON.stringify(data.hours))
          return
        }
      } catch (error) {
        console.error('Error loading hours from API:', error)
      }
      // Fallback to localStorage
      const savedHours = localStorage.getItem('admin_hours')
      if (savedHours) {
        try {
          const parsed = JSON.parse(savedHours)
          setHoursData(parsed)
        } catch (error) {
          console.error('Error loading saved hours:', error)
        }
      }
    }
    loadHours()
  }, [])

  const handleSave = () => {
    // Guardar en localStorage para UI inmediata
    localStorage.setItem('admin_hours', JSON.stringify(hoursData))
    // Persistir en el servidor
    fetch('/api/hours', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours: hoursData })
    }).catch(error => console.error('Error saving hours to API:', error))
    setSavedMessage('Horarios actualizados correctamente')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const DayConfig = ({ day, label, config }: { day: keyof typeof hoursData, label: string, config: typeof hoursData.weekdays }) => (
    <div className="p-6 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{label}</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setHoursData({
              ...hoursData,
              [day]: { ...config, enabled: e.target.checked }
            })}
            className="mr-2"
          />
          <span className="text-sm">Abierto</span>
        </label>
      </div>
      {config.enabled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Apertura</label>
            <input
              type="text"
              value={config.open}
              onChange={(e) => setHoursData({
                ...hoursData,
                [day]: { ...config, open: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="8:00 AM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cierre</label>
            <input
              type="text"
              value={config.close}
              onChange={(e) => setHoursData({
                ...hoursData,
                [day]: { ...config, close: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="6:00 PM"
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>
          <h1 className="text-4xl font-bold mb-2">Horarios de Atención</h1>
          <p className="text-xl text-blue-100">Edita los horarios de negocio</p>
        </div>
      </section>

      {savedMessage && (
        <section className="section-padding pt-8">
          <div className="container-custom">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
              {savedMessage}
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card">
            <div className="space-y-6">
              <DayConfig day="weekdays" label="Lunes a Viernes" config={hoursData.weekdays} />
              <DayConfig day="saturday" label="Sábado" config={hoursData.saturday} />
              <DayConfig day="sunday" label="Domingo" config={hoursData.sunday} />

              <div className="pt-6 border-t">
                <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

