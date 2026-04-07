'use client'

import ServiceCard from '@/components/ServiceCard'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { useLanguage } from '@/contexts/LanguageContext'
import { useServices, useContactInfo } from '@/hooks/useData'

export default function ServicesPage() {
  const { t } = useLanguage()
  const { services, isReady } = useServices()
  const contact = useContactInfo()

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <FadeIn className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.servicesPage.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.servicesPage.heroDescription}
          </p>
        </FadeIn>
      </section>

      {/* Services Grid */}
      {services.length > 0 ? (
        <section className="section-padding">
          <div className="container-custom">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <StaggerItem key={service.id}>
                  <ServiceCard service={service} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ) : (
        <section className="section-padding">
          <div className="container-custom text-center py-12">
            <p className="text-xl text-gray-500">No services available at this time.</p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-primary-500 text-white">
        <FadeIn className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.servicesPage.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.servicesPage.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="btn-secondary text-lg px-8 py-4">
              {t.home.bookAppointment}
            </a>
            <a href={`tel:${contact.phoneTel}`} className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
              {t.servicesPage.callToAction}
            </a>
          </div>
        </FadeIn>
      </section>
    </div>
  )
}
