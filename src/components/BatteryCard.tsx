'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Battery } from '@/types'
import { Shield, ShoppingCart, Check, GitCompareArrows, Phone } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAddToCart } from '@/hooks/useAddToCart'
import { getWhatsAppUrl, getWhatsAppBatteryMessage } from '@/lib/whatsapp'

interface BatteryCardProps {
  battery: Battery
  previousPrice?: number
}

export default function BatteryCard({ battery, previousPrice }: BatteryCardProps) {
  const { t, locale } = useLanguage()
  const { addedToCart, handleAddToCart } = useAddToCart()

  return (
    <div className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {battery.image && battery.image !== '/logo.png' ? (
          <Image
            src={battery.image}
            alt={battery.vehicle}
            fill
            className="object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; (e.target as HTMLImageElement).className = 'object-contain p-6' }}
          />
        ) : (
          <Image
            src="/logo.png"
            alt={battery.vehicle}
            width={200}
            height={120}
            className="object-contain p-4"
            loading="lazy"
          />
        )}
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
              image: '/logo.png',
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
                {locale === 'es' ? 'Agregado' : 'Added to Cart'}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {locale === 'es' ? 'Agregar al Carrito' : 'Add to Cart'}
              </>
            )}
          </button>
          <a
            href={getWhatsAppUrl(getWhatsAppBatteryMessage(battery.vehicle, battery.price, locale))}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium bg-[#25D366] hover:bg-[#1DA851] text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {locale === 'es' ? 'Cotizar por WhatsApp' : 'Quote via WhatsApp'}
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:+18327625299"
              className="btn-outline flex items-center justify-center text-sm py-2"
            >
              <Phone className="mr-1 w-3 h-3" />
              {locale === 'es' ? 'Llamar' : 'Call Now'}
            </a>
            <Link
              href={`/batteries/compare?ids=${battery.id}`}
              className="flex items-center justify-center text-sm py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500 rounded-lg transition-colors"
            >
              <GitCompareArrows className="mr-1 w-3 h-3" />
              {locale === 'es' ? 'Comparar' : 'Compare'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
