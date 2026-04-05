'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Save, ArrowLeft, ImageIcon, Upload, X } from 'lucide-react'
import { siteImages as initialImages, type SiteImages } from '@/data'
import { batteries as initialBatteries } from '@/data'
import { services as initialServices } from '@/data'
import { blogPosts as initialBlogPosts } from '@/data'
import type { Battery, Service, BlogPost } from '@/types'

// Componente auxiliar para botón de carga
function UploadButton({ 
  id, 
  category, 
  section, 
  subKey, 
  uploading,
  onUpload,
  recommendedSize
}: { 
  id: string
  category: string
  section: keyof SiteImages
  subKey?: string
  uploading: string | null
  onUpload: (file: File, category: string, section: keyof SiteImages, subKey?: string) => void
  recommendedSize: string
}) {
  const uploadKey = subKey ? `${section}-${subKey}` : section
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">
        Subir Imagen
        <span className="ml-2 text-xs text-gray-500 font-normal">
          (Recomendado: {recommendedSize})
        </span>
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file, category, section, subKey)
        }}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        className="flex items-center justify-center space-x-2 px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors"
      >
        <Upload className="w-4 h-4" />
        <span>{uploading === uploadKey ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
      </label>
    </div>
  )
}

// Componente simple para imágenes individuales
function SimpleUploadButton({
  id,
  uploading,
  uploadKey,
  onUpload,
  recommendedSize
}: {
  id: string
  uploading: string | null
  uploadKey: string
  onUpload: (file: File) => void
  recommendedSize: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-2">
        Subir Imagen
        <span className="ml-2 text-xs text-gray-500 font-normal">
          (Recomendado: {recommendedSize})
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
        <span>{uploading === uploadKey ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
      </label>
    </div>
  )
}

export default function ImagesAdminPage() {
  const [imagesData, setImagesData] = useState<SiteImages>(initialImages)
  const [batteriesData, setBatteriesData] = useState<Battery[]>(initialBatteries)
  const [servicesData, setServicesData] = useState<Service[]>(initialServices)
  const [blogPostsData, setBlogPostsData] = useState<BlogPost[]>(initialBlogPosts)
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [uploading, setUploading] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Cargar imágenes del sitio guardadas desde localStorage
    const savedSiteImages = localStorage.getItem('admin_site_images')
    if (savedSiteImages) {
      try {
        const parsed = JSON.parse(savedSiteImages)
        setImagesData(parsed)
      } catch (error) {
        console.error('Error loading saved site images:', error)
      }
    }

    // Cargar baterías guardadas desde localStorage
    const savedBatteries = localStorage.getItem('admin_batteries')
    if (savedBatteries) {
      try {
        const parsed = JSON.parse(savedBatteries)
        setBatteriesData(parsed)
      } catch (error) {
        console.error('Error loading saved batteries:', error)
        setBatteriesData(initialBatteries)
      }
    } else {
      setBatteriesData(initialBatteries)
    }

    // Cargar servicios y blog posts desde localStorage si existen
    const savedServices = localStorage.getItem('admin_services')
    if (savedServices) {
      try {
        const parsed = JSON.parse(savedServices)
        setServicesData(parsed)
      } catch (error) {
        console.error('Error loading saved services:', error)
      }
    }

    const savedBlogPosts = localStorage.getItem('admin_blog')
    if (savedBlogPosts) {
      try {
        const parsed = JSON.parse(savedBlogPosts)
        setBlogPostsData(parsed)
      } catch (error) {
        console.error('Error loading saved blog posts:', error)
      }
    }
  }, [])

  const handleFileUpload = async (file: File, category: string, section: keyof SiteImages, subKey?: string) => {
    const uploadKey = subKey ? `${section}-${subKey}` : section
    setUploading(uploadKey)
    
    try {
      const formData = new FormData()
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = subKey ? `${subKey}-${timestamp}.${fileExtension}` : `${section}-${timestamp}.${fileExtension}`
      
      formData.append('file', file)
      formData.append('category', category)
      formData.append('fileName', fileName)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      let data: { success?: boolean; url?: string; error?: string }
      try {
        data = await response.json()
      } catch {
        throw new Error('La respuesta del servidor no es válida. ¿Estás en producción? Las subidas solo funcionan en localhost.')
      }

      if (response.ok && data.success && data.url) {
        // Actualizar la URL de la imagen en el estado
        handleImageChange(section, subKey, data.url)
        // Obtener el estado actual de localStorage (evita condiciones de carrera)
        let baseImages: SiteImages
        try {
          const currentSaved = localStorage.getItem('admin_site_images')
          baseImages = currentSaved ? JSON.parse(currentSaved) : { ...imagesData }
        } catch {
          baseImages = { ...imagesData }
        }
        const updatedImages = { ...baseImages }
        if (subKey && typeof updatedImages[section] === 'object') {
          (updatedImages[section] as any)[subKey] = data.url
        } else if (!subKey) {
          (updatedImages[section] as any) = data.url
        }
        localStorage.setItem('admin_site_images', JSON.stringify(updatedImages))
        // Guardar en Vercel Blob para que todos los visitantes vean los cambios
        try {
          await fetch('/api/site-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteImages: updatedImages }),
          })
        } catch (e) {
          console.error('Error saving to server:', e)
        }
        window.dispatchEvent(new Event('siteImagesUpdated'))
        setSavedMessage('Imagen subida correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        const errorMsg = data?.error || (response.status === 500 
          ? 'Error del servidor. En producción, conecta un Blob Store en Vercel para habilitar subidas.' 
          : `Error ${response.status}`)
        alert('Error al subir la imagen: ' + errorMsg)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      const msg = error instanceof Error ? error.message : 'Error al subir la imagen'
      alert(msg)
    } finally {
      setUploading(null)
    }
  }

  const handleSave = async () => {
    // Guardar imágenes del sitio en localStorage y en Vercel Blob
    localStorage.setItem('admin_site_images', JSON.stringify(imagesData))
    try {
      await fetch('/api/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteImages: imagesData }),
      })
    } catch (e) {
      console.error('Error saving to server:', e)
    }
    window.dispatchEvent(new Event('siteImagesUpdated'))
    
    // Guardar baterías con sus imágenes actualizadas
    if (batteriesData.length > 0) {
      localStorage.setItem('admin_batteries', JSON.stringify(batteriesData))
      window.dispatchEvent(new Event('batteriesUpdated'))
    }
    
    // Guardar servicios con sus imágenes actualizadas
    if (servicesData.length > 0) {
      localStorage.setItem('admin_services', JSON.stringify(servicesData))
      window.dispatchEvent(new Event('servicesUpdated'))
    }
    
    // Guardar blog posts con sus imágenes actualizadas
    if (blogPostsData.length > 0) {
      localStorage.setItem('admin_blog', JSON.stringify(blogPostsData))
      window.dispatchEvent(new Event('blogUpdated'))
    }
    
    setSavedMessage('Todas las imágenes actualizadas correctamente')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleImageChange = (section: keyof SiteImages, subKey?: string, value?: string) => {
    if (subKey && typeof imagesData[section] === 'object') {
      setImagesData({
        ...imagesData,
        [section]: {
          ...(imagesData[section] as any),
          [subKey]: value
        }
      })
    } else if (!subKey && typeof value === 'string') {
      setImagesData({
        ...imagesData,
        [section]: value
      })
    }
  }

  // Función para actualizar imagen individual de batería
  const handleBatteryImageUpload = async (batteryId: string, file: File) => {
    const uploadKey = `battery-${batteryId}`
    setUploading(uploadKey)
    
    try {
      const uploadFormData = new FormData()
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `battery-${batteryId}-${timestamp}.${fileExtension}`
      
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'batteries')
      uploadFormData.append('fileName', fileName)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.success) {
        const updatedBatteries = batteriesData.map(b => 
          b.id === batteryId ? { ...b, image: data.url } : b
        )
        setBatteriesData(updatedBatteries)
        localStorage.setItem('admin_batteries', JSON.stringify(updatedBatteries))
        window.dispatchEvent(new Event('batteriesUpdated'))
        setSavedMessage('Imagen de batería subida correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        alert('Error al subir la imagen: ' + data.error)
      }
    } catch (error) {
      console.error('Error uploading battery image:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  // Función para actualizar imagen individual de servicio
  const handleServiceImageUpload = async (serviceId: string, file: File) => {
    const uploadKey = `service-${serviceId}`
    setUploading(uploadKey)
    
    try {
      const uploadFormData = new FormData()
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `service-${serviceId}-${timestamp}.${fileExtension}`
      
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'services')
      uploadFormData.append('fileName', fileName)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.success) {
        const updatedServices = servicesData.map(s => 
          s.id === serviceId ? { ...s, image: data.url } : s
        )
        setServicesData(updatedServices)
        localStorage.setItem('admin_services', JSON.stringify(updatedServices))
        window.dispatchEvent(new Event('servicesUpdated'))
        setSavedMessage('Imagen de servicio subida correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        alert('Error al subir la imagen: ' + data.error)
      }
    } catch (error) {
      console.error('Error uploading service image:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  // Función para actualizar imagen individual de blog post
  const handleBlogImageUpload = async (postId: string, file: File) => {
    const uploadKey = `blog-${postId}`
    setUploading(uploadKey)
    
    try {
      const uploadFormData = new FormData()
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `blog-${postId}-${timestamp}.${fileExtension}`
      
      uploadFormData.append('file', file)
      uploadFormData.append('category', 'blog')
      uploadFormData.append('fileName', fileName)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (data.success) {
        const updatedPosts = blogPostsData.map(p => 
          p.id === postId ? { ...p, image: data.url } : p
        )
        setBlogPostsData(updatedPosts)
        localStorage.setItem('admin_blog', JSON.stringify(updatedPosts))
        window.dispatchEvent(new Event('blogUpdated'))
        setSavedMessage('Imagen de blog subida correctamente')
        setTimeout(() => setSavedMessage(''), 3000)
      } else {
        alert('Error al subir la imagen: ' + data.error)
      }
    } catch (error) {
      console.error('Error uploading blog image:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="sticky top-0 z-10 bg-primary-500 text-white section-padding shadow-lg">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Link>
          <h1 className="text-4xl font-bold mb-2">Gestión de Imágenes</h1>
          <p className="text-xl text-blue-100">Administra todas las imágenes del sitio web</p>
          <p className="mt-2 text-sm text-blue-200">
            En producción (Vercel) las imágenes se guardan en Vercel Blob. Conecta un Blob Store en el proyecto para habilitarlo.
          </p>
          <div className="mt-4">
            <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-primary-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
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

      <section className="section-padding">
        <div className="container-custom">
          {/* Logo */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Logo Principal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <UploadButton
                  id="logo-upload"
                  category="home"
                  section="logo"
                  uploading={uploading}
                  onUpload={handleFileUpload}
                  recommendedSize="224x112 px"
                />
              </div>
              <div className="flex items-center justify-center">
                {imagesData.logo && (
                  <div className="relative w-48 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagesData.logo}
                      alt="Logo preview"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imagen Hero</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <UploadButton
                  id="hero-upload"
                  category="home"
                  section="hero"
                  uploading={uploading}
                  onUpload={handleFileUpload}
                  recommendedSize="600x400 px"
                />
              </div>
              <div className="flex items-center justify-center">
                {imagesData.hero && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagesData.hero}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Image */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imagen de Ubicación</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <UploadButton
                  id="location-upload"
                  category="home"
                  section="location"
                  uploading={uploading}
                  onUpload={handleFileUpload}
                  recommendedSize="16:9 ratio (~1200x675 px)"
                />
              </div>
              <div className="flex items-center justify-center">
                {imagesData.location && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagesData.location}
                      alt="Location preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes de Servicios</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Suspensión</label>
                  </div>
                  <UploadButton
                    id="services-suspension-upload"
                    category="services"
                    section="services"
                    subKey="suspension"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.services.suspension && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.services.suspension}
                        alt="Suspension preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Frenos</label>
                  </div>
                  <UploadButton
                    id="services-brakeReplacement-upload"
                    category="services"
                    section="services"
                    subKey="brakeReplacement"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.services.brakeReplacement && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.services.brakeReplacement}
                        alt="Brakes preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Refrigerante</label>
                  </div>
                  <UploadButton
                    id="services-coolantFlush-upload"
                    category="services"
                    section="services"
                    subKey="coolantFlush"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.services.coolantFlush && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.services.coolantFlush}
                        alt="Coolant preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Transmisión</label>
                  </div>
                  <UploadButton
                    id="services-transmissionService-upload"
                    category="services"
                    section="services"
                    subKey="transmissionService"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.services.transmissionService && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.services.transmissionService}
                        alt="Transmission preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Diagnóstico de Batería</label>
                  </div>
                  <UploadButton
                    id="services-batteryDiagnostic-upload"
                    category="services"
                    section="services"
                    subKey="batteryDiagnostic"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.services.batteryDiagnostic && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.services.batteryDiagnostic}
                        alt="Battery diagnostic preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Batteries Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes de Baterías</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Toyota Prius</label>
                  </div>
                  <UploadButton
                    id="batteries-prius-upload"
                    category="batteries"
                    section="batteries"
                    subKey="prius"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.batteries.prius && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.batteries.prius}
                        alt="Prius battery preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Toyota Camry</label>
                  </div>
                  <UploadButton
                    id="batteries-camry-upload"
                    category="batteries"
                    section="batteries"
                    subKey="camry"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.batteries.camry && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.batteries.camry}
                        alt="Camry battery preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lexus RX</label>
                  </div>
                  <UploadButton
                    id="batteries-lexusRx-upload"
                    category="batteries"
                    section="batteries"
                    subKey="lexusRx"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.batteries.lexusRx && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.batteries.lexusRx}
                        alt="Lexus RX battery preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lexus CT</label>
                  </div>
                  <UploadButton
                    id="batteries-lexusCt-upload"
                    category="batteries"
                    section="batteries"
                    subKey="lexusCt"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.batteries.lexusCt && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.batteries.lexusCt}
                        alt="Lexus CT battery preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Blog Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes del Blog</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 1</label>
                  </div>
                  <UploadButton
                    id="blog-blog1-upload"
                    category="blog"
                    section="blog"
                    subKey="blog1"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog1 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog1}
                        alt="Blog 1 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 2</label>
                  </div>
                  <UploadButton
                    id="blog-blog2-upload"
                    category="blog"
                    section="blog"
                    subKey="blog2"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog2 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog2}
                        alt="Blog 2 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 3</label>
                  </div>
                  <UploadButton
                    id="blog-blog3-upload"
                    category="blog"
                    section="blog"
                    subKey="blog3"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog3 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog3}
                        alt="Blog 3 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 4</label>
                  </div>
                  <UploadButton
                    id="blog-blog4-upload"
                    category="blog"
                    section="blog"
                    subKey="blog4"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog4 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog4}
                        alt="Blog 4 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 5</label>
                  </div>
                  <UploadButton
                    id="blog-blog5-upload"
                    category="blog"
                    section="blog"
                    subKey="blog5"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog5 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog5}
                        alt="Blog 5 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Artículo 6</label>
                  </div>
                  <UploadButton
                    id="blog-blog6-upload"
                    category="blog"
                    section="blog"
                    subKey="blog6"
                    uploading={uploading}
                    onUpload={handleFileUpload}
                    recommendedSize="16:9 ratio (~192px altura)"
                  />
                </div>
                <div className="flex items-center justify-center">
                  {imagesData.blog.blog6 && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagesData.blog.blog6}
                        alt="Blog 6 preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Individual Battery Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes Individuales de Baterías</h2>
            </div>
            
            <div className="space-y-6">
              {batteriesData.map((battery) => (
                <div key={battery.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{battery.vehicle}</h3>
                    <p className="text-sm text-gray-600">{battery.batteryType}</p>
                  </div>
                  <div className="md:col-span-1 space-y-4">
                    <SimpleUploadButton
                      id={`battery-individual-${battery.id}`}
                      uploading={uploading}
                      uploadKey={`battery-${battery.id}`}
                      onUpload={(file) => handleBatteryImageUpload(battery.id, file)}
                      recommendedSize="16:9 ratio"
                    />
                    {battery.image && (
                      <p className="text-xs text-gray-500 truncate">{battery.image}</p>
                    )}
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    {battery.image && (
                      <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={battery.image}
                          alt={battery.vehicle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Service Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes Individuales de Servicios</h2>
            </div>
            
            <div className="space-y-6">
              {servicesData.map((service) => (
                <div key={service.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{service.category}</p>
                  </div>
                  <div className="md:col-span-1 space-y-4">
                    <SimpleUploadButton
                      id={`service-individual-${service.id}`}
                      uploading={uploading}
                      uploadKey={`service-${service.id}`}
                      onUpload={(file) => handleServiceImageUpload(service.id, file)}
                      recommendedSize="16:9 ratio"
                    />
                    {service.image && (
                      <p className="text-xs text-gray-500 truncate">{service.image}</p>
                    )}
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    {service.image && (
                      <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individual Blog Post Images */}
          <div className="card mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <ImageIcon className="w-6 h-6 text-primary-500" />
              <h2 className="text-2xl font-bold">Imágenes Individuales de Blog Posts</h2>
            </div>
            
            <div className="space-y-6">
              {blogPostsData.map((post) => (
                <div key={post.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600">{post.category}</p>
                  </div>
                  <div className="md:col-span-1 space-y-4">
                    <SimpleUploadButton
                      id={`blog-individual-${post.id}`}
                      uploading={uploading}
                      uploadKey={`blog-${post.id}`}
                      onUpload={(file) => handleBlogImageUpload(post.id, file)}
                      recommendedSize="16:9 ratio"
                    />
                    {post.image && (
                      <p className="text-xs text-gray-500 truncate">{post.image}</p>
                    )}
                  </div>
                  <div className="md:col-span-1 flex items-center justify-center">
                    {post.image && (
                      <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button (también visible arriba en el header) */}
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

