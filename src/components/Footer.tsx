'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useContactInfo, useBusinessHours, useSiteImages, useServices, useBatteries, useReviews, useBlogPosts } from '@/hooks/useData'
import NewsletterSignup from '@/components/NewsletterSignup'

export default function Footer() {
  const { t, locale } = useLanguage()
  const contact = useContactInfo()
  const { weekdayHours, saturdayHours, sundayHours } = useBusinessHours()
  const siteImages = useSiteImages()
  const { services } = useServices()
  const { batteries } = useBatteries()
  const { reviews } = useReviews()
  const { blogPosts } = useBlogPosts()

  // Rutas según idioma
  const routes = {
    privacy: locale === 'es' ? '/privacidad' : '/privacy',
    terms: locale === 'es' ? '/terminos' : '/terms',
    warranty: locale === 'es' ? '/garantia' : '/warranty'
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-56 h-28 bg-white rounded-lg p-2">
                <Image
                  src={siteImages.logo || "/logo.jpg"}
                  alt="Hybrid Tech Auto Logo"
                  width={224}
                  height={112}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {services.length > 0 && (
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                    {t.nav.services}
                  </Link>
                </li>
              )}
              {batteries.length > 0 && (
                <li>
                  <Link href="/batteries" className="text-gray-300 hover:text-white transition-colors">
                    {t.nav.batteries}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/booking" className="text-gray-300 hover:text-white transition-colors">
                  {t.home.bookAppointment}
                </Link>
              </li>
              {reviews.length > 0 && (
                <li>
                  <Link href="/reviews" className="text-gray-300 hover:text-white transition-colors">
                    {t.nav.reviews}
                  </Link>
                </li>
              )}
              {blogPosts.length > 0 && (
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                    {t.nav.blog}
                  </Link>
                </li>
              )}
              <li>
                <Link href="/my-orders" className="text-gray-300 hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.contactInfo}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  {contact.address}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href={`tel:${contact.phoneTel}`} className="text-gray-300 hover:text-white transition-colors">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-gray-300 hover:text-white transition-colors">
                  {contact.email}
                </a>
              </div>
            </div>
          </div>

          {/* Hours & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t.footer.businessHours}</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p>Mon-Fri: {weekdayHours}</p>
                  <p>Sat: {saturdayHours}</p>
                  <p>Sun: {sundayHours}</p>
                </div>
              </div>
            </div>
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {t.footer.allRights}
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t.nav.admin}
              </Link>
              <Link href={routes.privacy} className="text-gray-400 hover:text-white text-sm transition-colors">
                {t.footer.privacyPolicy}
              </Link>
              <Link href={routes.terms} className="text-gray-400 hover:text-white text-sm transition-colors">
                {t.footer.termsOfService}
              </Link>
              <Link href={routes.warranty} className="text-gray-400 hover:text-white text-sm transition-colors">
                {t.footer.warranty}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
