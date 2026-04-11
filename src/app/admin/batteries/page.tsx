'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Save, Plus, Edit, Trash2, ArrowLeft, Upload, Search, Loader2 } from 'lucide-react'
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
  const [batteriesData, setBatteriesData] = useState<Battery[]>([])
  const [loading, setLoading] = useState(true)
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
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterBrand, setFilterBrand] = useState<string>('all')
  const [filterCondition, setFilterCondition] = useState<string>('all')

  // Load batteries from API only — no static fallback
  useEffect(() => {
    const loadBatteries = async () => {
      try {
        const response = await fetch('/api/batteries?limit=0')
        const data = await response.json()
        if (data.success && data.batteries && data.batteries.length > 0) {
          console.log('Admin: loaded', data.batteries.length, 'batteries from server')
          setBatteriesData(data.batteries)
        } else {
          console.warn('Admin: API returned empty batteries')
          setBatteriesData([])
        }
      } catch (error) {
        console.error('Admin: Error loading batteries:', error)
        setBatteriesData([])
      } finally {
        setLoading(false)
      }
    }

    loadBatteries()
  }, [])

  // Save batteries to server — only called on explicit user actions
  const saveBatteriesToServer = useCallback(async (batteries: Battery[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/batteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batteries }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMsg = `Error del servidor (${response.status})`
        try {
          const errorData = JSON.parse(errorText)
          errorMsg = errorData.error || errorMsg
        } catch {
          // response wasn't JSON
        }
        if (response.status === 401) {
          errorMsg = 'Sesión expirada. Por favor, vuelve a iniciar sesión.'
        }
        console.error('Admin: server save failed:', errorMsg)
        return { success: false, error: errorMsg }
      }

      const data = await response.json()
      if (data.success) {
        console.log('Admin: saved', batteries.length, 'batteries to server')
        return { success: true }
      } else {
        console.error('Admin: server save failed:', data.error)
        return { success: false, error: data.error || 'Error desconocido al guardar' }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error de conexión'
      console.error('Admin: Error saving batteries:', error)
      return { success: false, error: msg }
    }
  }, [])

  // Extract unique brands from loaded data
  const availableBrands = useMemo(() => {
    const brands = new Set<string>()
    batteriesData.forEach(b => {
      const brand = b.vehicle.split(' ')[0]
      if (brand) brands.add(brand)
    })
    return Array.from(brands).sort()
  }, [batteriesData])

  // Filter batteries
  const filteredBatteries = useMemo(() => {
    return batteriesData.filter(battery => {
      if (searchTerm && !battery.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (filterBrand !== 'all' && !battery.vehicle.startsWith(filterBrand)) {
        return false
      }
      if (filterCondition !== 'all' && battery.condition !== filterCondition) {
        return false
      }
      return true
    })
  }, [batteriesData, searchTerm, filterBrand, filterCondition])

  const handleAdd = () => {
    setFormData({
      vehicle: '',
      batteryType: '',
      condition: 'refurbished' as 'new' | 'refurbished',
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

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta batería?')) {
      const previous = batteriesData
      const updated = batteriesData.filter(b => b.id !== id)
      setBatteriesData(updated)
      setErrorMessage('')
      setSaving(true)

      const result = await saveBatteriesToServer(updated)
      setSaving(false)

      if (result.success) {
        setSavedMessage('Batería eliminada correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        setBatteriesData(previous) // rollback
        setErrorMessage(`Error al eliminar: ${result.error}`)
        setTimeout(() => setErrorMessage(''), 5000)
      }
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
        setFormData(prev => ({ ...prev, image: data.url }))
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

  const handleSave = async () => {
    if (!formData.vehicle || !formData.batteryType || !formData.description) {
      alert('Por favor completa los campos: Vehículo, Tipo de Batería y Descripción')
      return
    }

    // Default image to logo if not provided
    const batteryData = {
      ...formData,
      image: formData.image || '/logo.png',
    }

    const previous = batteriesData
    let updated: Battery[]

    if (editingId) {
      updated = batteriesData.map(b =>
        b.id === editingId ? { ...batteryData as Battery, id: editingId } : b
      )
    } else if (isAdding) {
      const maxId = batteriesData.reduce((max, b) => Math.max(max, parseInt(b.id) || 0), 0)
      const newId = (maxId + 1).toString()
      updated = [...batteriesData, { ...batteryData as Battery, id: newId }]
    } else {
      return
    }

    setBatteriesData(updated)
    setErrorMessage('')
    setSaving(true)

    const result = await saveBatteriesToServer(updated)
    setSaving(false)

    if (result.success) {
      setSavedMessage(editingId ? 'Batería actualizada correctamente' : 'Batería agregada correctamente')
      setIsAdding(false)
      setEditingId(null)
      setFormData({ vehicle: '', batteryType: '', condition: 'refurbished' as 'new' | 'refurbished', price: 0, warranty: '', image: '', description: '' })
      setTimeout(() => setSavedMessage(''), 3000)
    } else {
      setBatteriesData(previous) // rollback
      setErrorMessage(`Error al guardar: ${result.error}`)
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando baterías...</p>
        </div>
      </div>
    )
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
              <p className="text-xl text-blue-100">
                {batteriesData.length} baterías en la base de datos
              </p>
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

      {errorMessage && (
        <section className="section-padding pt-8">
          <div className="container-custom">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              {errorMessage}
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
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setEditingId(null)
                      setErrorMessage('')
                    }}
                    className="btn-outline"
                    disabled={saving}
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
                {/* Brand Filter - dynamic from data */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.batteries.filterBrand}</label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">{t.batteries.allBrands}</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
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
                {filteredBatteries.length} de {batteriesData.length} baterías
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding">
        <div className="container-custom">
          {batteriesData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No hay baterías en la base de datos</p>
              <p className="text-sm">Agrega una nueva batería con el botón de arriba</p>
            </div>
          ) : (
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
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                    <Image
                      src={battery.image || '/logo.png'}
                      alt={battery.vehicle}
                      width={200}
                      height={120}
                      className="object-contain p-4"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }}
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{battery.vehicle}</h3>
                  <p className="text-sm text-gray-600 mb-2">{battery.batteryType}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-3xl font-bold text-primary-500">${battery.price}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${battery.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {battery.condition === 'new' ? 'Nueva' : 'Refurbished'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{battery.description}</p>
                  <span className="inline-block px-3 py-1 bg-secondary-100 text-secondary-800 rounded-full text-sm">
                    {battery.warranty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
