'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Battery } from '@/types'
import { ArrowRight, Shield, ShoppingCart, Check, GitCompareArrows } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAddToCart } from '@/hooks/useAddToCart'
import { BLUR_DATA_URL } from '@/lib/imageUtils'

interface BatteryCardProps {
  battery: Battery
  previousPrice?: number
}

export default function BatteryCard({ battery, previousPrice }: BatteryCardProps) {
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
            {previousPrice && previousPrice > battery.price && (
              <span className="text-sm text-gray-400 line-through mr-2">
                ${previousPrice}
              </span>
            )}
            <span className="text-3xl font-bold text-primary-500">
              ${battery.price}
            </span>
            {previousPrice && previousPrice > battery.price && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                Save ${previousPrice - battery.price}
              </span>
            )}
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
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/booking"
              className="btn-outline flex items-center justify-center text-sm py-2"
            >
              {t.batteries.getQuote}
              <ArrowRight className="ml-1 w-3 h-3" />
            </Link>
            <Link
              href={`/batteries/compare?ids=${battery.id}`}
              className="flex items-center justify-center text-sm py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500 rounded-lg transition-colors"
            >
              <GitCompareArrows className="mr-1 w-3 h-3" />
              Compare
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
