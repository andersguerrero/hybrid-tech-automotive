'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react'
import { contactInfo as initialContactInfo } from '@/data'

export default function ContactAdminPage() {
  const [contactData, setContactData] = useState(initialContactInfo)
  const [savedMessage, setSavedMessage] = useState<string>('')

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await fetch('/api/contact-info')
        const data = await response.json()
        if (data.success && data.contact) {
          setContactData(data.contact)
          localStorage.setItem('admin_contact', JSON.stringify(data.contact))
          return
        }
      } catch (error) {
        console.error('Error loading contact info from API:', error)
      }
      // Fallback to localStorage
      const savedContact = localStorage.getItem('admin_contact')
      if (savedContact) {
        try {
          const parsed = JSON.parse(savedContact)
          setContactData(parsed)
        } catch (error) {
          console.error('Error loading saved contact info:', error)
        }
      }
    }
    loadContact()
  }, [])

  const handleSave = () => {
    // Guardar en localStorage para UI inmediata
    localStorage.setItem('admin_contact', JSON.stringify(contactData))
    // Persistir en el servidor
    fetch('/api/contact-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact: contactData })
    }).catch(error => console.error('Error saving contact info to API:', error))
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

