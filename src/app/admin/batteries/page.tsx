'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Save, Lock, Plus, Edit, Trash2, ArrowLeft, Upload, Search } from 'lucide-react'
import { batteries as initialBatteries } from '@/data'
import type { Battery } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

// Componente auxiliar para botón de carga de imagen
function ImageUploadButton({ 
  id, 
  uploading,
  onUpload,
  uploadingText,
  selectFileText
}: { 
  id: string
  uploading: boolean
  onUpload: (file: File) => void
  uploadingText: string
  selectFileText: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">
        {uploadingText}
        <span className="ml-2 text-xs text-gray-500 font-normal">
          (Recomendado: 16:9 ratio)
        </span>
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        className="flex items-center justify-center space-x-2 px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span>{uploading ? uploadingText : selectFileText}</span>
      </label>
    </div>
  )
}

export default function BatteriesAdminPage() {
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [batteriesData, setBatteriesData] = useState<Battery[]>(initialBatteries)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Battery>>({
    vehicle: '',
    batteryType: '',
    condition: 'refurbished' as 'new' | 'refurbished',
    price: 0,
    warranty: '',
    image: '',
    description: ''
  })
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterBrand, setFilterBrand] = useState<string>('all')
  const [filterCondition, setFilterCondition] = useState<string>('all')

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }

    // Cargar baterías guardadas desde localStorage
    const savedBatteries = localStorage.getItem('admin_batteries')
    if (savedBatteries) {
      try {
        const parsed = JSON.parse(savedBatteries)
        console.log('Loading saved batteries from localStorage:', parsed)
        setBatteriesData(parsed)
      } catch (error) {
        console.error('Error loading saved batteries:', error)
        // Si hay error, usar las iniciales
        setBatteriesData(initialBatteries)
      }
    } else {
      // Si no hay baterías guardadas, usar las iniciales
      console.log('No saved batteries found, using initial batteries')
      setBatteriesData(initialBatteries)
    }
  }, [])

  // Guardar baterías en localStorage cuando cambien
  useEffect(() => {
    if (isAuthenticated && batteriesData.length > 0) {
      console.log('Saving batteries to localStorage:', batteriesData)
      localStorage.setItem('admin_batteries', JSON.stringify(batteriesData))
      localStorage.setItem('batteries_edited_by_admin', 'true')
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('batteriesUpdated'))
    }
  }, [batteriesData, isAuthenticated])

  // Filter batteries
  const filteredBatteries = useMemo(() => {
    return batteriesData.filter(battery => {
      // Search term filter
      if (searchTerm && !battery.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Brand filter
      if (filterBrand !== 'all' && !battery.vehicle.startsWith(filterBrand)) {
        return false
      }
      
      // Condition filter
      if (filterCondition !== 'all' && battery.condition !== filterCondition) {
        return false
      }
      
      return true
    })
  }, [batteriesData, searchTerm, filterBrand, filterCondition])

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
              <h1 className="text-2xl font-bold">{t.admin.loginTitle}</h1>
              <p className="text-gray-600 mt-2">{t.admin.loginSubtitle}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.passwordLabel}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder={t.admin.passwordPlaceholder}
                  required
                />
              </div>
              <button type="submit" className="w-full btn-primary">{t.admin.loginButton}</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const handleAdd = () => {
    setFormData({
      vehicle: '',
      batteryType: '',
      price: 0,
      warranty: '',
      image: '',
      description: ''
    })
    setIsAdding(true)
    setEditingId(null)
  }

  const handleEdit = (battery: Battery) => {
    setFormData(battery)
    setEditingId(battery.id)
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta batería?')) {
      setBatteriesData(batteriesData.filter(b => b.id !== id))
      setSavedMessage('Batería eliminada correctamente')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    
    try {
      const uploadFormData = new FormData()
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `battery-${timestamp}.${fileExtension}`
      
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'batteries')
      uploadFormData.append('fileName', fileName)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.success) {
        console.log('Image uploaded successfully:', data.url)
        const updatedFormData = { ...formData, image: data.url }
        console.log('Updated formData:', updatedFormData)
        setFormData(updatedFormData)
        setSavedMessage('Imagen subida correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        alert('Error al subir la imagen: ' + data.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    console.log('Current formData:', formData)
    if (!formData.vehicle || !formData.batteryType || !formData.description || !formData.image) {
      console.log('Missing fields:', {
        vehicle: formData.vehicle,
        batteryType: formData.batteryType,
        description: formData.description,
        image: formData.image
      })
      alert('Por favor completa todos los campos')
      return
    }

    if (editingId) {
      setBatteriesData(batteriesData.map(b => 
        b.id === editingId ? { ...formData as Battery, id: editingId } : b
      ))
      setSavedMessage('Batería actualizada correctamente')
    } else if (isAdding) {
      const newId = (batteriesData.length + 1).toString()
      setBatteriesData([...batteriesData, { ...formData as Battery, id: newId }])
      setSavedMessage('Batería agregada correctamente')
    }
    
    setIsAdding(false)
    setEditingId(null)
    setFormData({ vehicle: '', batteryType: '', condition: 'refurbished' as 'new' | 'refurbished', price: 0, warranty: '', image: '', description: '' })
    setTimeout(() => setSavedMessage(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.admin.backToPanel}
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{t.admin.batteries}</h1>
              <p className="text-xl text-blue-100">{t.admin.batteriesDesc}</p>
            </div>
            {!isAdding && !editingId && (
              <button onClick={handleAdd} className="btn-secondary flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>{t.admin.addNew} {t.admin.batteries}</span>
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
                {editingId ? 'Editar Batería' : 'Nueva Batería'}
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vehículo</label>
                    <input
                      type="text"
                      value={formData.vehicle}
                      onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Toyota Prius (2010–2015)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Batería</label>
                    <input
                      type="text"
                      value={formData.batteryType}
                      onChange={(e) => setFormData({ ...formData, batteryType: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="Rebuilt NiMH"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Condición</label>
                    <select
                      value={formData.condition || 'refurbished'}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'new' | 'refurbished' })}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="new">Nueva</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>
                  <div></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Precio ($)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Garantía</label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="1 year"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <ImageUploadButton
                      id="battery-image-upload"
                      uploading={uploading}
                      onUpload={handleImageUpload}
                      uploadingText="Subiendo imagen..."
                      selectFileText="Seleccionar Imagen"
                    />
                    {formData.image && (
                      <div className="text-sm text-gray-600">
                        <p>Imagen cargada: {formData.image}</p>
                      </div>
                    )}
                  </div>
                  {formData.image && (
                    <div className="flex items-center justify-center">
                      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={formData.image}
                          alt="Battery preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
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

      {!isAdding && !editingId && (
        <section className="section-padding bg-white border-b">
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t.batteries.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.batteries.filterBrand}</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">{t.batteries.allBrands}</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Lexus">Lexus</option>
                  </select>
                </div>
                
                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.batteries.filterCondition}</label>
                  <select
                    value={filterCondition}
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">{t.batteries.allConditions}</option>
                    <option value="new">{t.batteries.newBattery}</option>
                    <option value="refurbished">{t.batteries.refurbishedBattery}</option>
                  </select>
                </div>
              </div>
              
              {/* Results Counter */}
              <div className="mt-4 text-sm text-gray-600">
                {filteredBatteries.length} {t.batteries.resultsFound}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBatteries.map((battery) => (
              <div key={battery.id} className="card relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                  <button 
                    onClick={() => handleEdit(battery)}
                    className="bg-primary-500 text-white p-2 rounded" 
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(battery.id)}
                    className="bg-red-500 text-white p-2 rounded" 
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                  {battery.image && (
                    <Image
                      src={battery.image}
                      alt={battery.vehicle}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="font-semibold mb-2">{battery.vehicle}</h3>
                <p className="text-sm text-gray-600 mb-2">{battery.batteryType}</p>
                <p className="text-3xl font-bold text-primary-500 mb-2">${battery.price}</p>
                <p className="text-sm text-gray-600 mb-4">{battery.description}</p>
                <span className="inline-block px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                  {battery.warranty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

