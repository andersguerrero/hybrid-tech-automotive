'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, ArrowLeft, Type, ChevronDown, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/i18n/translations'

type TranslationKey = string
type TranslationValue = string | Record<string, any>

interface TranslationSection {
  title: string
  keys: string[]
  collapsed?: boolean
}

export default function TextsAdminPage() {
  const { locale, setLocale, t } = useLanguage()
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    nav: true,
    home: true,
    services: true,
    batteries: true,
    reviews: true,
    blog: true,
    contact: true,
    common: true
  })
  const [localTranslations, setLocalTranslations] = useState(translations)

  useEffect(() => {
    // Load custom translations
    const loadCustomTranslations = () => {
      const customEn = localStorage.getItem('admin_translations_en')
      const customEs = localStorage.getItem('admin_translations_es')
      
      setLocalTranslations({
        en: customEn ? JSON.parse(customEn) : translations.en,
        es: customEs ? JSON.parse(customEs) : translations.es
      })
    }

    loadCustomTranslations()

    // Listen for updates
    window.addEventListener('customTranslationUpdate', loadCustomTranslations)

    return () => {
      window.removeEventListener('customTranslationUpdate', loadCustomTranslations)
    }
  }, [])

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const handleSave = () => {
    // Trigger reload of translations
    window.dispatchEvent(new Event('customTranslationUpdate'))
    
    setSavedMessage(locale === 'en' ? 'Texts saved successfully' : 'Textos guardados correctamente')
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const getCurrentTranslationValue = (keyPath: string): string => {
    const keys = keyPath.split('.')
    let value: any = localTranslations[locale as 'en' | 'es']
    
    for (const key of keys) {
      value = value?.[key]
      if (!value) return ''
    }
    
    return typeof value === 'string' ? value : ''
  }

  const setTranslationValue = (keyPath: string, newValue: string) => {
    // Save to localStorage
    const savedTranslations = localStorage.getItem(`admin_translations_${locale}`)
    const currentTranslations = savedTranslations ? JSON.parse(savedTranslations) : JSON.parse(JSON.stringify(translations[locale as 'en' | 'es']))
    
    const keys = keyPath.split('.')
    const lastKey = keys.pop()!
    let target: any = currentTranslations
    
    for (const key of keys) {
      if (!target[key]) target[key] = {}
      target = target[key]
    }
    
    target[lastKey] = newValue
    
    localStorage.setItem(`admin_translations_${locale}`, JSON.stringify(currentTranslations))
    
    // Update local state
    setLocalTranslations({
      ...localTranslations,
      [locale]: currentTranslations
    })
  }

  const sections = [
    {
      title: locale === 'en' ? 'Navigation' : 'Navegación',
      key: 'nav',
      fields: [
        { key: 'nav.home', label: locale === 'en' ? 'Home' : 'Inicio' },
        { key: 'nav.services', label: locale === 'en' ? 'Services' : 'Servicios' },
        { key: 'nav.batteries', label: locale === 'en' ? 'Batteries' : 'Baterías' },
        { key: 'nav.reviews', label: locale === 'en' ? 'Reviews' : 'Reseñas' },
        { key: 'nav.blog', label: locale === 'en' ? 'Blog' : 'Blog' },
        { key: 'nav.contact', label: locale === 'en' ? 'Contact' : 'Contacto' },
        { key: 'nav.admin', label: locale === 'en' ? 'Admin' : 'Admin' }
      ]
    },
    {
      title: locale === 'en' ? 'Home Page' : 'Página de Inicio',
      key: 'home',
      fields: [
        { key: 'home.heroTitle1', label: locale === 'en' ? 'Hero Title 1' : 'Título Principal 1' },
        { key: 'home.heroTitle2', label: locale === 'en' ? 'Hero Title 2' : 'Título Principal 2' },
        { key: 'home.heroDescription', label: locale === 'en' ? 'Hero Description' : 'Descripción Principal', textarea: true },
        { key: 'home.bookAppointment', label: locale === 'en' ? 'Book Appointment Button' : 'Botón Reservar Cita' },
        { key: 'home.viewServices', label: locale === 'en' ? 'View Services Button' : 'Botón Ver Servicios' },
        { key: 'home.whyChoose', label: locale === 'en' ? 'Why Choose Title' : 'Título Por Qué Elegirnos' },
        { key: 'home.whyChooseDesc', label: locale === 'en' ? 'Why Choose Description' : 'Descripción Por Qué Elegirnos' },
        { key: 'home.servicesTitle', label: locale === 'en' ? 'Services Title' : 'Título Servicios' },
        { key: 'home.servicesSubtitle', label: locale === 'en' ? 'Services Subtitle' : 'Subtítulo Servicios' },
        { key: 'home.batteriesTitle', label: locale === 'en' ? 'Batteries Title' : 'Título Baterías' },
        { key: 'home.batteriesSubtitle', label: locale === 'en' ? 'Batteries Subtitle' : 'Subtítulo Baterías' },
        { key: 'home.ctaTitle', label: locale === 'en' ? 'Call to Action Title' : 'Título Llamado a la Acción' },
        { key: 'home.ctaDesc', label: locale === 'en' ? 'Call to Action Description' : 'Descripción Llamado a la Acción' }
      ]
    },
    {
      title: locale === 'en' ? 'Services Page' : 'Página de Servicios',
      key: 'services',
      fields: [
        { key: 'services.title', label: locale === 'en' ? 'Services Title' : 'Título Servicios' },
        { key: 'services.subtitle', label: locale === 'en' ? 'Services Subtitle' : 'Subtítulo Servicios' },
        { key: 'services.transparentPricing', label: locale === 'en' ? 'Transparent Pricing' : 'Precios Transparentes' },
        { key: 'services.bookNow', label: locale === 'en' ? 'Book Now Button' : 'Botón Reservar Ahora' }
      ]
    },
    {
      title: locale === 'en' ? 'Batteries Page' : 'Página de Baterías',
      key: 'batteries',
      fields: [
        { key: 'batteries.title', label: locale === 'en' ? 'Batteries Title' : 'Título Baterías' },
        { key: 'batteries.subtitle', label: locale === 'en' ? 'Batteries Subtitle' : 'Subtítulo Baterías' },
        { key: 'batteries.startingPrice', label: locale === 'en' ? 'Starting Price Label' : 'Etiqueta Precio Inicial' },
        { key: 'batteries.warranty', label: locale === 'en' ? 'Warranty Label' : 'Etiqueta Garantía' },
        { key: 'batteries.getQuote', label: locale === 'en' ? 'Get Quote Button' : 'Botón Obtener Cotización' }
      ]
    },
    {
      title: locale === 'en' ? 'Reviews Page' : 'Página de Reseñas',
      key: 'reviews',
      fields: [
        { key: 'reviews.heroTitle', label: locale === 'en' ? 'Reviews Title' : 'Título Reseñas' },
        { key: 'reviews.heroDescription', label: locale === 'en' ? 'Reviews Description' : 'Descripción Reseñas' },
        { key: 'reviews.googleReviewsTitle', label: locale === 'en' ? 'Google Reviews Title' : 'Título Reseñas de Google' },
        { key: 'reviews.googleReviewsDesc', label: locale === 'en' ? 'Google Reviews Description' : 'Descripción Reseñas de Google' }
      ]
    },
    {
      title: locale === 'en' ? 'Blog Page' : 'Página de Blog',
      key: 'blog',
      fields: [
        { key: 'blog.heroTitle', label: locale === 'en' ? 'Blog Title' : 'Título Blog' },
        { key: 'blog.heroDescription', label: locale === 'en' ? 'Blog Description' : 'Descripción Blog', textarea: true },
        { key: 'blog.readMore', label: locale === 'en' ? 'Read More Button' : 'Botón Leer Más' }
      ]
    },
    {
      title: locale === 'en' ? 'Contact Page' : 'Página de Contacto',
      key: 'contact',
      fields: [
        { key: 'contact.heroTitle', label: locale === 'en' ? 'Contact Title' : 'Título Contacto' },
        { key: 'contact.heroDescription', label: locale === 'en' ? 'Contact Description' : 'Descripción Contacto' },
        { key: 'contact.businessHoursLabel', label: locale === 'en' ? 'Business Hours Label' : 'Etiqueta Horarios' }
      ]
    },
    {
      title: locale === 'en' ? 'Footer' : 'Pie de Página',
      key: 'footer',
      fields: [
        { key: 'footer.allRights', label: locale === 'en' ? 'All Rights Reserved' : 'Todos los Derechos Reservados' },
        { key: 'footer.privacyPolicy', label: locale === 'en' ? 'Privacy Policy' : 'Política de Privacidad' },
        { key: 'footer.termsOfService', label: locale === 'en' ? 'Terms of Service' : 'Términos de Servicio' },
        { key: 'footer.warranty', label: locale === 'en' ? 'Warranty Policy' : 'Política de Garantía' }
      ]
    }
  ]

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
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Type className="w-10 h-10 mr-3" />
                {locale === 'en' ? 'Content Management' : 'Gestión de Contenido'}
              </h1>
              <p className="text-xl text-blue-100">
                {locale === 'en' ? 'Edit all texts on your website' : 'Edita todos los textos de tu sitio web'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="flex items-center border border-white/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setLocale('en')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    locale === 'en' ? 'bg-white text-primary-500' : 'text-white hover:bg-white/10'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLocale('es')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    locale === 'es' ? 'bg-white text-primary-500' : 'text-white hover:bg-white/10'
                  }`}
                >
                  ES
                </button>
              </div>
            </div>
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
        <div className="container-custom max-w-5xl">
          {sections.map((section) => (
            <div key={section.key} className="card mb-6">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                {collapsedSections[section.key] ? (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {!collapsedSections[section.key] && (
                <div className="space-y-4 pt-4 border-t">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.textarea ? (
                        <textarea
                          value={getCurrentTranslationValue(field.key)}
                          onChange={(e) => setTranslationValue(field.key, e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={getCurrentTranslationValue(field.key)}
                          onChange={(e) => setTranslationValue(field.key, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="card">
            <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>{locale === 'en' ? 'Save All Changes' : 'Guardar Todos los Cambios'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

