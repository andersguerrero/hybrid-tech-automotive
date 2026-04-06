'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import ContactForm from './ContactForm'
import { useLanguage } from '@/contexts/LanguageContext'
import { useContactInfo, useBusinessHours } from '@/hooks/useData'

export default function ContactPage() {
  const { t } = useLanguage()
  const contact = useContactInfo()
  const { weekdayHours, saturdayHours, sundayHours } = useBusinessHours()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.contact.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.contact.heroDescription}
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t.contact.getInTouch}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {t.contact.getInTouchDesc}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.contact.addressLabel}</h3>
                    <p className="text-gray-600">{contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.contact.phoneLabel}</h3>
                    <p className="text-gray-600">
                      <a href={`tel:${contact.phoneTel}`} className="hover:text-primary-500 transition-colors">
                        {contact.phone}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t.contact.phoneDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.contact.emailLabel}</h3>
                    <p className="text-gray-600">
                      <a href={`mailto:${contact.email}`} className="hover:text-primary-500 transition-colors">
                        {contact.email}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t.contact.emailDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-secondary-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.contact.businessHoursLabel}</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Mon-Fri: {weekdayHours}</p>
                      <p>Sat: {saturdayHours}</p>
                      <p>Sun: {sundayHours}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.contact.findUsTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {t.contact.findUsDesc}
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
