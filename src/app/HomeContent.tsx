'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Clock, Star } from 'lucide-react'
import ServiceCard from '@/components/ServiceCard'
import BatteryCard from '@/components/BatteryCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBatteries, useServices, useSiteImages, useContactInfo } from '@/hooks/useData'

export default function HomeContent() {
  const { t } = useLanguage()
  const { batteries, isReady: batteriesReady } = useBatteries()
  const { services, isReady: servicesReady } = useServices()
  const siteImages = useSiteImages()
  const contact = useContactInfo()

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {t.home.heroTitle1}
                <span className="block text-secondary-200">{t.home.heroTitle2}</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                {t.home.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                  {t.home.bookAppointment}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                {services.length > 0 && (
                  <Link href="/services" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
                    {t.nav.services}
                  </Link>
                )}
                {batteries.length > 0 && (
                  <Link href="/batteries" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
                    {t.nav.batteries}
                  </Link>
                )}
              </div>
            </div>
            <div className="relative">
              <Image
                src={siteImages.hero || "/images/home/hero-battery.jpg"}
                alt="Hybrid battery replacement"
                width={600}
                height={400}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.whyChoose}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.home.whyChooseDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature1Title}</h3>
              <p className="text-gray-600">{t.home.feature1Desc}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature2Title}</h3>
              <p className="text-gray-600">{t.home.feature2Desc}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{t.home.feature3Title}</h3>
              <p className="text-gray-600">{t.home.feature3Desc}</p>
            </div>
          </div>
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
