'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Service } from '@/types'
import { ArrowRight, ShoppingCart, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { t } = useLanguage()
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart({
      id: `service-${service.id}`,
      name: getName(),
      price: service.price,
      type: 'service',
      image: service.image,
      description: getDescription(),
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }
  
  // Map service IDs to name and description keys
  const getName = () => {
    switch (service.id) {
      case '1':
        return t.services.suspensionInspection
      case '2':
        return t.services.brakeReplacement
      case '3':
        return t.services.coolantFlush
      case '4':
        return t.services.transmissionService
      case '5':
        return t.services.batteryDiagnostic
      default:
        return service.name
    }
  }
  
  const getDescription = () => {
    switch (service.id) {
      case '1':
        return t.services.suspensionDesc
      case '2':
        return t.services.brakeDesc
      case '3':
        return t.services.coolantDesc
      case '4':
        return t.services.transmissionDesc
      case '5':
        return t.services.batteryDiagnosticDesc
      default:
        return service.description
    }
  }
  
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
          className="object-cover"
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900">{getName()}</h3>
          <span className="text-2xl font-bold text-primary-500">
            ${service.price}
          </span>
        </div>
        
        <p className="text-gray-600">{getDescription()}</p>
        
        <div className="flex items-center justify-between pt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
            {getCategory()}
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddToCart}
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
