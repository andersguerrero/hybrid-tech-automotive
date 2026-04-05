'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Battery } from '@/types'
import { ArrowRight, Shield, ShoppingCart, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAddToCart } from '@/hooks/useAddToCart'
import { BLUR_DATA_URL } from '@/lib/imageUtils'

interface BatteryCardProps {
  battery: Battery
}

export default function BatteryCard({ battery }: BatteryCardProps) {
  const { t } = useLanguage()
  const { addedToCart, handleAddToCart } = useAddToCart()

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={battery.image}
          alt={battery.vehicle}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {battery.vehicle}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{battery.batteryType}</p>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-3xl font-bold text-primary-500">
              ${battery.price}
            </span>
            <p className="text-sm text-gray-600">{t.batteries.startingPrice}</p>
          </div>

          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Shield className="w-4 h-4 mr-1" />
              {battery.warranty}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm">{battery.description}</p>

        <div className="pt-4 space-y-2">
          <button
            onClick={(e) => handleAddToCart(e, {
              id: `battery-${battery.id}`,
              name: battery.vehicle,
              price: battery.price,
              type: 'battery',
              image: battery.image,
              description: battery.description,
            })}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
              addedToCart
                ? 'bg-green-500 text-white'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </button>
          <Link
            href="/booking"
            className="btn-outline w-full flex items-center justify-center"
          >
            {t.batteries.getQuote}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
