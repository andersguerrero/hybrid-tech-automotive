'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, AlertCircle, MapPin, Phone, Mail, Lock, ArrowLeft } from 'lucide-react'
import { contactInfo as initialContactInfo } from '@/data'

export default function ContactAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [contactData, setContactData] = useState(initialContactInfo)
  const [savedMessage, setSavedMessage] = useState<string>('')

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="card">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">Acceso Administrativo</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Contraseña"
                required
              />
              <button type="submit" className="w-full btn-primary">Ingresar</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    // Aquí se guardaría en backend/base de datos
    setSavedMessage('Información actualizada correctamente')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>
          <h1 className="text-4xl font-bold mb-2">Información de Contacto</h1>
          <p className="text-xl text-blue-100">Edita la información de contacto del negocio</p>
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
            <div className="space-y-8">
              {/* Dirección */}
              <div>
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-primary-500 mr-2" />
                  <h2 className="text-2xl font-bold">Dirección</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Calle y Número</label>
                    <input
                      type="text"
                      value={contactData.address.street}
                      onChange={(e) => setContactData({
                        ...contactData,
                        address: { ...contactData.address, street: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ciudad</label>
                    <input
                      type="text"
                      value={contactData.address.city}
                      onChange={(e) => setContactData({
                        ...contactData,
                        address: { ...contactData.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <input
                      type="text"
                      value={contactData.address.state}
                      onChange={(e) => setContactData({
                        ...contactData,
                        address: { ...contactData.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Código Postal</label>
                    <input
                      type="text"
                      value={contactData.address.zip}
                      onChange={(e) => setContactData({
                        ...contactData,
                        address: { ...contactData.address, zip: e.target.value }
                      })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <div className="flex items-center mb-6">
                  <Phone className="w-6 h-6 text-primary-500 mr-2" />
                  <h2 className="text-2xl font-bold">Teléfono</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Teléfono</label>
                  <input
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center mb-6">
                  <Mail className="w-6 h-6 text-primary-500 mr-2" />
                  <h2 className="text-2xl font-bold">Email</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Botón Guardar */}
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

