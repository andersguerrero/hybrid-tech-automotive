'use client'

import { Star, Quote } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useReviews } from '@/hooks/useData'

export default function ReviewsPage() {
  const { t } = useLanguage()
  const reviews = useReviews()
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.reviews.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.reviews.heroDescription}
          </p>
        </div>
      </section>

      {/* Google Reviews Rating */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-2xl font-bold text-gray-900">5.0</span>
            </div>
            <p className="text-gray-600 mb-4">Basado en nuestras reviews de Google</p>
            <a
              href="https://share.google/4eXqgy02NYsMBAvto"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center"
            >
              Ver en Google
            </a>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.reviews.recentReviewsTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {t.reviews.recentReviewsDesc}
            </p>
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t.reviews.noReviewsTitle || "No hay reviews todavía"}
              </h3>
              <p className="text-gray-600 mb-6">
                {t.reviews.noReviewsDesc || "Sé el primero en dejarnos una reseña en Google"}
              </p>
              <a
                href="https://share.google/4eXqgy02NYsMBAvto"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center"
              >
                {t.reviews.viewOnGoogle}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="card hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {t.reviews.verified}
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-primary-200 mb-2" />
                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{review.author}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.reviews.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.reviews.ctaDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="btn-secondary text-lg px-8 py-4">
              {t.home.bookAppointment}
            </a>
            <a href="tel:+18327625299" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
              {t.reviews.callToAction}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
