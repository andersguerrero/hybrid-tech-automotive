import { useState, useCallback } from 'react'
import { useCart } from '@/contexts/CartContext'
import { trackEvent } from '@/lib/analytics'

interface AddToCartItem {
  id: string
  name: string
  price: number
  type: 'service' | 'battery'
  image?: string
  description?: string
}

export function useAddToCart() {
  const { addToCart } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = useCallback((e: React.MouseEvent, item: AddToCartItem) => {
    e.preventDefault()
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type,
      image: item.image,
      description: item.description,
    })
    trackEvent('add_to_cart', { item_name: item.name, item_type: item.type, price: item.price })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }, [addToCart])

  return { addedToCart, handleAddToCart }
}
