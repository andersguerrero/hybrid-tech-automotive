'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/types'
import { ArrowRight, ShoppingCart, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAddToCart } from '@/hooks/useAddToCart'
import { BLUR_DATA_URL } from '@/lib/imageUtils'

interface ServiceCardProps {
  service: Service
}

const SERVICE_TRANSLATION_KEYS: Record<string, { name: string; desc: string }> = {
  '1': { name: 'suspensionInspection', desc: 'suspensionDesc' },
  '2': { name: 'brakeReplacement', desc: 'brakeDesc' },
  '3': { name: 'coolantFlush', desc: 'coolantDesc' },
  '4': { name: 'transmissionService', desc: 'transmissionDesc' },
  '5': { name: 'batteryDiagnostic', desc: 'batteryDiagnosticDesc' },
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { t } = useLanguage()
  const { addedToCart, handleAddToCart } = useAddToCart()

  const keys = SERVICE_TRANSLATION_KEYS[service.id]
  const name = keys
    ? (t.services as Record<string, string>)[keys.name] || service.name
    : service.name
  const description = keys
    ? (t.services as Record<string, string>)[keys.desc] || service.description
    : service.description

  const getCategory = () => {
    switch (service.category) {
      case 'diagnostic':
        return t.services.categoryDiagnostic
      case 'repair':
        return t.services.categoryRepair
      case 'maintenance':
        return t.services.categoryMaintenance
      default:
        const categoryStr = String(service.category)
        return categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)
    }
  }

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <span className="text-2xl font-bold text-primary-500">
            ${service.price}
          </span>
        </div>

        <p className="text-gray-600">{description}</p>

        <div className="flex items-center justify-between pt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
            {getCategory()}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => handleAddToCart(e, {
                id: `service-${service.id}`,
                name,
                price: service.price,
                type: 'service',
                image: service.image,
                description,
              })}
              className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Add to Cart
                </>
              )}
            </button>
            <Link
              href="/booking"
              className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              {t.services.bookNow}
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
