'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera, X, Wrench, Search, Zap } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { galleryItems } from '@/data/gallery'
import { getWhatsAppUrl, getWhatsAppGeneralMessage } from '@/lib/whatsapp'

export default function GalleryPage() {
  const { t, locale } = useLanguage()
  const [filter, setFilter] = useState<string>('all')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const categories = [
    { key: 'all', label: locale === 'es' ? 'Todos' : 'All', icon: Camera },
    { key: 'installation', label: locale === 'es' ? 'Instalaciones' : 'Installations', icon: Wrench },
    { key: 'diagnostic', label: locale === 'es' ? 'Diagnósticos' : 'Diagnostics', icon: Search },
    { key: 'repair', label: locale === 'es' ? 'Reparaciones' : 'Repairs', icon: Zap },
  ]

  const filtered = filter === 'all'
    ? galleryItems
    : galleryItems.filter(item => item.category === filter)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Nuestro Trabajo' : 'Our Work'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'es'
              ? 'Vea ejemplos reales de nuestro trabajo en baterías híbridas y servicios automotrices.'
              : 'See real examples of our hybrid battery work and automotive services.'}
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${
                  filter === cat.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => setLightboxImage(item.image)}
                className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 text-left"
              >
                <div className="relative h-64">
                  <Image
                    src={item.image}
                    alt={locale === 'es' ? item.titleEs : item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 group-hover:from-black/80 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <span className="text-xs font-medium bg-primary-500 px-2 py-1 rounded-full mb-2 inline-block">
                      {item.vehicle}
                    </span>
                    <h3 className="text-lg font-bold">
                      {locale === 'es' ? item.titleEs : item.title}
                    </h3>
                    <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                      {locale === 'es' ? item.descriptionEs : item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {locale === 'es' ? '¿Necesita Servicio de Batería Híbrida?' : 'Need Hybrid Battery Service?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Contáctenos hoy para una cotización gratuita en su batería híbrida.'
              : 'Contact us today for a free quote on your hybrid battery.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={getWhatsAppUrl(getWhatsAppGeneralMessage(locale))}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1DA851] text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {locale === 'es' ? 'Chat por WhatsApp' : 'Chat on WhatsApp'}
            </a>
            <a href="/booking" className="btn-secondary text-lg px-8 py-4">
              {locale === 'es' ? 'Reservar Cita' : 'Book Appointment'}
            </a>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
            <Image
              src={lightboxImage}
              alt="Gallery photo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
