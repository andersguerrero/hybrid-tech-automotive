'use client'

import { useState } from 'react'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, CreditCard } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useServices, useBatteries } from '@/hooks/useData'
import BookingCalendar from '@/components/BookingCalendar'

export default function BookingPage() {
  const { t } = useLanguage()
  const { services } = useServices()
  const { batteries } = useBatteries()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    comments: '',
    paymentMethod: 'stripe'
  })

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [selectedServicePrice, setSelectedServicePrice] = useState<number | null>(null)

  const allServices = [
    ...services.map(s => ({ ...s, type: 'service' })),
    ...batteries.map(b => ({ ...b, type: 'battery', name: `${b.vehicle} - ${b.batteryType}` }))
  ]

  // Calculate price when service is selected
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFormData({ ...formData, service: value })
    
    if (value) {
      const [type, id] = value.split('-')
      if (type === 'service') {
        const service = services.find(s => s.id === id)
        setSelectedServicePrice(service?.price || null)
      } else if (type === 'battery') {
        const battery = batteries.find(b => b.id === id)
        setSelectedServicePrice(battery?.price || null)
      }
    } else {
      setSelectedServicePrice(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      // If Stripe is selected, create checkout session first
      if (formData.paymentMethod === 'stripe') {
        if (!selectedServicePrice) {
          setErrorMessage('Please select a service to proceed with payment')
          setIsSubmitting(false)
          return
        }

        // Save booking data temporarily to sessionStorage
        sessionStorage.setItem('pending_booking', JSON.stringify(formData))

        // Find the selected service name
        const [type, id] = formData.service.split('-')
        let serviceName = ''
        if (type === 'service') {
          const service = services.find(s => s.id === id)
          serviceName = service?.name || 'Service'
        } else {
          const battery = batteries.find(b => b.id === id)
          serviceName = battery ? `${battery.vehicle} - ${battery.batteryType}` : 'Battery Service'
        }

        // Create Stripe checkout session
        const checkoutResponse = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName,
            servicePrice: selectedServicePrice,
            customerEmail: formData.email,
            bookingData: formData
          }),
        })

        const checkoutResult = await checkoutResponse.json()

        if (checkoutResult.success && checkoutResult.url) {
          // Redirect to Stripe Checkout
          window.location.href = checkoutResult.url
          return // Don't reset form yet, will happen after payment
        } else {
          setErrorMessage(checkoutResult.error || 'Failed to create payment session')
          setIsSubmitting(false)
          return
        }
      }

      // For non-Stripe payment methods, process booking directly
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(result.message || t.booking.successMessage)
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          time: '',
          comments: '',
          paymentMethod: 'stripe'
        })
        setSelectedServicePrice(null)
        setSelectedDate(null)
        setSelectedTime('')
      } else {
        setErrorMessage(result.error || t.booking.errorMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(t.booking.generalError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t.booking.heroTitle}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {t.booking.heroDescription}
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="card">
            {successMessage && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800" role="status">
                {successMessage}
              </div>
            )}
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
                  {t.booking.personalInfo}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.booking.fullName}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t.booking.fullNamePlaceholder}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.booking.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t.booking.emailPlaceholder}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.booking.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t.booking.phonePlaceholder}
                    />
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-primary-500" />
                  {t.booking.serviceSelection}
                </h2>
                
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.selectService}
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleServiceChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">{t.booking.selectService}</option>
                    {allServices.map((service) => (
                      <option key={`${service.type}-${service.id}`} value={`${service.type}-${service.id}`}>
                        {service.name} - ${service.price}
                      </option>
                    ))}
                  </select>
                  {selectedServicePrice && (
                    <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Total:</span> <span className="text-primary-600 font-bold text-lg">${selectedServicePrice}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Date and Time */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-primary-500" />
                  {t.booking.dateTime}
                </h2>

                <BookingCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={(date) => {
                    setSelectedDate(date)
                    const formatted = date.toISOString().split('T')[0]
                    setFormData(prev => ({ ...prev, date: formatted }))
                  }}
                  onTimeSelect={(time) => {
                    setSelectedTime(time)
                    setFormData(prev => ({ ...prev, time }))
                  }}
                />
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
                    <span className="text-gray-700">Zelle (Instructions will be provided)</span>
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
                  {t.booking.additionalInfo}
                </h2>
                
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.booking.comments}
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={4}
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={t.booking.commentsPlaceholder}
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
                  {isSubmitting ? t.booking.submitting : t.booking.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
