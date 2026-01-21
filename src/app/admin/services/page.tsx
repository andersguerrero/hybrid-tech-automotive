'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Lock, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { services as initialServices } from '@/data'
import type { Service } from '@/types'

export default function ServicesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [servicesData, setServicesData] = useState(initialServices)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    price: 0,
    description: '',
    image: '',
    category: 'maintenance'
  })
  const [savedMessage, setSavedMessage] = useState<string>('')

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }

    // Cargar servicios guardados desde localStorage
    const savedServices = localStorage.getItem('admin_services')
    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices)
        setServicesData(parsed)
      } catch (error) {
        console.error('Error loading saved services:', error)
        setServicesData(initialServices)
      }
    } else {
      setServicesData(initialServices)
    }
  }, [])

  // Guardar servicios en localStorage cuando cambien
  useEffect(() => {
    if (isAuthenticated && servicesData.length > 0) {
      localStorage.setItem('admin_services', JSON.stringify(servicesData))
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('servicesUpdated'))
    }
  }, [servicesData, isAuthenticated])

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

  const handleAdd = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      image: '',
      category: 'maintenance'
    })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (service: Service) => {
    setFormData(service)
    setEditingId(service.id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      setServicesData(servicesData.filter(s => s.id !== id))
      setSavedMessage('Servicio eliminado correctamente')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.image) {
      alert('Por favor completa todos los campos')
      return
    }

    if (editingId) {
      setServicesData(servicesData.map(s => 
        s.id === editingId ? { ...formData as Service, id: editingId } : s
      ))
      setSavedMessage('Servicio actualizado correctamente')
    } else if (isAdding) {
      const newId = (servicesData.length + 1).toString()
      setServicesData([...servicesData, { ...formData as Service, id: newId }])
      setSavedMessage('Servicio agregado correctamente')
    }
    
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', price: 0, description: '', image: '', category: 'maintenance' })
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Gestión de Servicios</h1>
              <p className="text-xl text-blue-100">Administra tus servicios automotrices</p>
            </div>
            {!isAdding && !editingId && (
              <button onClick={handleAdd} className="btn-secondary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Nuevo Servicio</span>
              </button>
            )}
          </div>
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

      {(isAdding || editingId) && (
        <section className="section-padding pt-8">
          <div className="container-custom max-w-4xl">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre del Servicio</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Precio ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="maintenance">Mantenimiento</option>
                    <option value="repair">Reparación</option>
                    <option value="diagnostic">Diagnóstico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="/images/services/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-4">
                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Guardar</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsAdding(false)
                      setEditingId(null)
                    }}
                    className="btn-outline"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesData.map((service) => (
              <div key={service.id} className="card relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="bg-primary-500 text-white p-2 rounded" 
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="bg-red-500 text-white p-2 rounded" 
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                <h3 className="font-semibold mb-2">{service.name}</h3>
                <p className="text-2xl font-bold text-primary-500 mb-2">${service.price}</p>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {service.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

