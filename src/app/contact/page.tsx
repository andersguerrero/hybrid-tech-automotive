'use client'

import { MapPin, Phone, Mail, Clock, Star } from 'lucide-react'
import ContactForm from './ContactForm'
import { getWhatsAppUrl, getWhatsAppGeneralMessage } from '@/lib/whatsapp'
import { useLanguage } from '@/contexts/LanguageContext'
import { useContactInfo, useBusinessHours } from '@/hooks/useData'

export default function ContactPage() {
  const { t, locale } = useLanguage()
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

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-600">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
                    <p className="text-gray-600">
                      <a
                        href={getWhatsAppUrl(getWhatsAppGeneralMessage(locale))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-600 transition-colors"
                      >
                        {locale === 'es' ? 'Envíanos un mensaje' : 'Send us a message'}
                      </a>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {locale === 'es' ? 'Respuesta rápida garantizada' : 'Quick response guaranteed'}
                    </p>
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href="https://share.google/4eXqgy02NYsMBAvto"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center"
            >
              <Star className="w-5 h-5 mr-2" />
              {locale === 'es' ? 'Ver en Google' : 'See us on Google'}
            </a>
            <a
              href="https://share.google/4eXqgy02NYsMBAvto"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center justify-center"
            >
              {locale === 'es' ? 'Dejar una Reseña' : 'Leave a Review'}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
