'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, MessageSquare, CreditCard, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { calculateSalesTax } from '@/lib/taxCalculator'
import Link from 'next/link'
import Image from 'next/image'

export default function CheckoutPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { items, getTotalPrice, clearCart } = useCart()
  const total = getTotalPrice()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipCode: '',
    date: '',
    time: '',
    comments: '',
    paymentMethod: 'stripe'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Calculate tax based on zip code
  const { taxAmount, rate, state } = calculateSalesTax(formData.zipCode, total)
  const finalTotal = total + taxAmount

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items to your cart first.')
      setIsSubmitting(false)
      return
    }

    try {
      if (formData.paymentMethod === 'stripe') {
        // Prepare item references for server-side price validation
        const cartItemRefs = items.map(item => ({
          id: item.id,
          type: item.type,
          quantity: item.quantity,
        }))

        // Save booking data temporarily
        sessionStorage.setItem('pending_booking', JSON.stringify({
          ...formData,
          cartItems: items,
          subtotal: total,
          tax: taxAmount,
          total: finalTotal
        }))

        // Create Stripe checkout session (prices validated server-side)
        const checkoutResponse = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cartItemRefs,
            zipCode: formData.zipCode,
            customerEmail: formData.email,
            bookingData: {
              ...formData,
              cartItems: items,
              subtotal: total,
              tax: taxAmount,
              total: finalTotal
            }
          }),
        })

        const checkoutResult = await checkoutResponse.json()

        if (checkoutResult.success && checkoutResult.url) {
          // Redirect to Stripe Checkout
          window.location.href = checkoutResult.url
        } else {
          setErrorMessage(checkoutResult.error || 'Failed to create payment session')
        }
      } else {
        // For non-Stripe payment methods, process booking directly
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            cartItems: items,
            subtotal: total,
            tax: taxAmount,
            total: finalTotal
          }),
        })

        const result = await response.json()

        if (result.success) {
          // Save booking data for success page
          sessionStorage.setItem('pending_booking', JSON.stringify({
            ...formData,
            cartItems: items,
            subtotal: total,
            tax: taxAmount,
            total: finalTotal
          }))
          clearCart()
          router.push('/booking/success')
        } else {
          setErrorMessage(result.error || 'Failed to process booking')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="card">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add items to your cart to proceed with checkout.</p>
            <Link href="/services" className="btn-primary inline-block">
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Checkout</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Complete your order and schedule your appointment
          </p>
        </div>
      </section>

      {/* Checkout Form */}
      <section className="section-padding">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      {item.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                  {formData.zipCode && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 text-sm">
                        Tax {taxAmount > 0 ? `(${(rate * 100).toFixed(2)}% - ${state})` : '(0%)'}
                      </span>
                      <span className="font-semibold text-gray-900">${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-500">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="card">
                {errorMessage && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                      <User className="w-6 h-6 mr-3 text-primary-500" />
                      Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="(832) 123-4567"
                        />
                      </div>

                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="77373"
                          maxLength={5}
                        />
                        {formData.zipCode && (
                          <p className="text-xs text-gray-500 mt-1">
                            {taxAmount > 0 
                              ? `${state} - ${(rate * 100).toFixed(2)}% sales tax` 
                              : 'Tax rate: 0% (No sales tax in this state)'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                      <User className="w-6 h-6 mr-3 text-primary-500" />
                      Appointment Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time
                        </label>
                        <select
                          id="time"
                          name="time"
                          required
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-primary-500" />
                      Payment Method
                    </h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={formData.paymentMethod === 'stripe'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-gray-700">Credit Card (Stripe)</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="zelle"
                          checked={formData.paymentMethod === 'zelle'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-gray-700">Zelle</span>
                      </label>
                      
                      <label className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-gray-700">Cash (Pay in person)</span>
                      </label>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="w-6 h-6 mr-3 text-primary-500" />
                      Additional Information
                    </h2>
                    
                    <div>
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                      </label>
                      <textarea
                        id="comments"
                        name="comments"
                        rows={4}
                        value={formData.comments}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Any additional information..."
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : `Complete Order - $${finalTotal.toFixed(2)}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

