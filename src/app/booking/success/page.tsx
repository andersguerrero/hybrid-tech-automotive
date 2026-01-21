'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Calendar, Phone, Mail, Clock, CreditCard } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BookingSuccessPage() {
  const { t } = useLanguage()
  const [bookingData, setBookingData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Retrieve booking data from sessionStorage
    const pendingBooking = sessionStorage.getItem('pending_booking')
    if (pendingBooking) {
      try {
        setBookingData(JSON.parse(pendingBooking))
        // Clear the pending booking data
        sessionStorage.removeItem('pending_booking')
      } catch (error) {
        console.error('Error parsing booking data:', error)
      }
    }
    setLoading(false)
  }, [])

  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(832) 762-5299'
  
  // Determine if payment is completed or pending
  const isPaymentComplete = bookingData?.paymentMethod === 'stripe'
  const paymentMethodNames: { [key: string]: string } = {
    'stripe': 'Credit Card',
    'zelle': 'Zelle',
    'cash': 'Cash'
  }
  const paymentMethodName = bookingData?.paymentMethod 
    ? paymentMethodNames[bookingData.paymentMethod] || bookingData.paymentMethod
    : 'Credit Card'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto p-8">
        <div className="card">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <CheckCircle className={`w-20 h-20 mx-auto mb-4 ${isPaymentComplete ? 'text-green-500' : 'text-orange-500'}`} />
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {isPaymentComplete ? 'Payment Successful!' : 'Appointment Request Received'}
                </h1>
                <p className="text-lg text-gray-600">
                  {isPaymentComplete 
                    ? 'Thank you for your payment. Your appointment has been confirmed and you will receive a confirmation email shortly.'
                    : `Thank you for requesting an appointment. We'll contact you shortly to confirm your details and finalize your ${paymentMethodName} payment.`
                  }
                </p>
              </div>

              {bookingData && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Booking Details
                  </h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium text-gray-900">{bookingData.name}</p>
                        <p className="text-sm text-gray-600">{bookingData.email}</p>
                      </div>
                    </div>
                    {bookingData.phone && (
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{bookingData.phone}</p>
                        </div>
                      </div>
                    )}
                    {bookingData.date && (
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {new Date(bookingData.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })} {bookingData.time && `at ${bookingData.time}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {bookingData.cartItems && bookingData.cartItems.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">Order Items</p>
                          <div className="space-y-2">
                            {bookingData.cartItems.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                                <span className="font-medium text-gray-900">
                                  {item.name} (x{item.quantity})
                                </span>
                                <span className="text-primary-500 font-semibold">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          {(bookingData.subtotal || bookingData.total) && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                              {bookingData.subtotal && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Subtotal:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${bookingData.subtotal.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {bookingData.tax !== undefined && bookingData.tax > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Tax:</span>
                                  <span className="font-semibold text-gray-900">
                                    ${bookingData.tax.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between items-center border-t pt-2">
                                <span className="font-bold text-gray-900">Total:</span>
                                <span className="text-xl font-bold text-primary-500">
                                  ${bookingData.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {bookingData.service && !bookingData.cartItems && (
                      <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Service</p>
                          <p className="font-medium text-gray-900">{bookingData.service}</p>
                        </div>
                      </div>
                    )}
                    {bookingData.comments && (
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Additional Comments</p>
                          <p className="font-medium text-gray-900">{bookingData.comments}</p>
                        </div>
                      </div>
                    )}
                    {bookingData.paymentMethod && (
                      <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium text-gray-900">
                            {paymentMethodName} {!isPaymentComplete && <span className="text-orange-600">(Pending)</span>}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {isPaymentComplete ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                What's Next?
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">
                    You will receive a confirmation email with your appointment details
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">
                    We'll call you 24 hours before your appointment to confirm
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700">
                    Please arrive 10 minutes early for your scheduled appointment
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-orange-800 mb-4">
                What's Next?
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-700">
                    You will receive a confirmation email with your appointment details
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-700">
                    <strong>Payment not yet received.</strong> We'll contact you within 24 hours to confirm your details
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-700">
                    Once payment is confirmed, your appointment will be finalized
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-orange-700">
                    We'll send you a final confirmation once everything is set
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="btn-primary inline-flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <a
                href={`tel:${businessPhone.replace(/\D/g, '')}`}
                className="btn-outline inline-flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Need to reschedule or have questions? Call us at {businessPhone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
