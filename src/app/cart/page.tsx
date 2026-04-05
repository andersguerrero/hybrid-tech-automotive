'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, CreditCard, Lock } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CartPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart()
  const total = getTotalPrice()
  const [paymentMethod, setPaymentMethod] = useState('stripe')

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    router.push('/services')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary-500 text-white section-padding">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t.cart?.emptyTitle || 'Shopping Cart'}
            </h1>
          </div>
        </section>

        {/* Empty Cart */}
        <section className="section-padding">
          <div className="container-custom max-w-2xl mx-auto">
            <div className="card text-center">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t.cart?.emptyMessage || 'Your cart is empty'}
              </h2>
              <p className="text-gray-600 mb-8">
                {t.cart?.emptyDescription || 'Add items to your cart to get started.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/services" className="btn-primary">
                  {t.cart?.browseServices || 'Browse Services'}
                </Link>
                <Link href="/batteries" className="btn-outline">
                  {t.cart?.browseBatteries || 'Browse Batteries'}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.cart?.backToHome || 'Back to Home'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t.cart?.title || 'Shopping Cart'}
          </h1>
          <p className="text-xl text-blue-100">
            {t.cart?.subtitle || 'Review your items and proceed to checkout'}
          </p>
        </div>
      </section>

      {/* Cart Content */}
      <section className="section-padding">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t.cart?.itemsTitle || 'Items in Cart'}
                </h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  {t.cart?.clearCart || 'Clear Cart'}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="card flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  >
                    {/* Image */}
                    {item.image && (
                      <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize mb-2">
                        {item.type === 'service' ? (t.cart?.serviceType || 'Service') : (t.cart?.batteryType || 'Battery')}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 min-w-[3rem] text-center font-medium border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {t.cart?.unitPrice || 'Unit Price'}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {t.cart?.subtotal || 'Subtotal'}: 
                            <span className="font-semibold text-primary-500 ml-1">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="pt-6">
                <button
                  onClick={handleContinueShopping}
                  className="btn-outline inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t.cart?.continueShopping || 'Continue Shopping'}
                </button>
              </div>
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t.cart?.orderSummary || 'Order Summary'}
                </h2>

                {/* Summary Items */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t.cart?.items || 'Items'} ({items.length})</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t.cart?.subtotal || 'Subtotal'}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t.cart?.total || 'Total'}</span>
                      <span className="text-primary-500">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Preview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-primary-500" />
                    {t.cart?.paymentOptions || 'Payment Options'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Lock className="w-4 h-4 mr-2 text-green-600" />
                      <span>{t.cart?.securePayment || 'Secure Credit Card (Stripe)'}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-4 h-4 mr-2">💳</span>
                      <span>Zelle</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="w-4 h-4 mr-2">💰</span>
                      <span>{t.cart?.cashPayment || 'Cash (Pay in person)'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    {t.cart?.paymentNote || 'Select payment method at checkout'}
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-lg py-4 flex items-center justify-center"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {t.cart?.proceedToCheckout || 'Proceed to Checkout'}
                </button>

                {/* Security Note */}
                <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1" />
                  {t.cart?.secureCheckout || 'Secure checkout protected by SSL'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

