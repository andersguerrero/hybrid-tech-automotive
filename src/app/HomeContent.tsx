'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Clock, Star } from 'lucide-react'
import ServiceCard from '@/components/ServiceCard'
import BatteryCard from '@/components/BatteryCard'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBatteries, useServices, useSiteImages, useContactInfo } from '@/hooks/useData'
import { getWhatsAppUrl, getWhatsAppGeneralMessage } from '@/lib/whatsapp'

export default function HomeContent() {
  const { t, locale } = useLanguage()
  const { batteries, isReady: batteriesReady } = useBatteries()
  const { services, isReady: servicesReady } = useServices()
  const siteImages = useSiteImages()
  const contact = useContactInfo()

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left" className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {t.home.heroTitle1}
                <span className="block text-secondary-200">{t.home.heroTitle2}</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t.home.heroDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={getWhatsAppUrl(getWhatsAppGeneralMessage(locale))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-lg inline-flex items-center justify-center font-medium transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {locale === 'es' ? 'WhatsApp' : 'WhatsApp'}
                </a>
                <Link href="/booking" className="btn-secondary px-6 py-3 inline-flex items-center justify-center">
                  {t.home.bookAppointment}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </FadeIn>
            <FadeIn direction="right" className="relative">
              <Image
                src={siteImages.hero || "/images/home/hero-battery.jpg"}
                alt="Hybrid battery replacement"
                width={600}
                height={400}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-xl shadow-2xl"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.whyChoose}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.home.whyChooseDesc}
            </p>
          </FadeIn>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature1Title}</h3>
              <p className="text-gray-600">{t.home.feature1Desc}</p>
            </StaggerItem>
            <StaggerItem className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature2Title}</h3>
              <p className="text-gray-600">{t.home.feature2Desc}</p>
            </StaggerItem>
            <StaggerItem className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature3Title}</h3>
              <p className="text-gray-600">{t.home.feature3Desc}</p>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Services Section — only rendered after API confirms there are services */}
      {servicesReady && services.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.home.servicesTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.home.servicesDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {services.slice(0, 3).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/services" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                {t.home.viewAllServices}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Batteries Section — only rendered after API confirms there are batteries */}
      {batteriesReady && batteries.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t.home.batteriesTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.home.batteriesDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {batteries.slice(0, 2).map((battery) => (
                <BatteryCard key={battery.id} battery={battery} />
              ))}
            </div>
            <div className="text-center">
              <Link href="/batteries" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
                {t.home.viewAllBatteries}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.home.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.home.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-secondary text-lg px-8 py-4">
              {t.home.bookAppointment}
            </Link>
            <a href={`tel:${contact.phoneTel}`} className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
              {t.home.callToAction}
            </a>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.locationTitle}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {t.home.locationDesc}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
            <iframe
              src={contact.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
