'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, Package, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types'

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  cancelled: XCircle,
  pending: Clock,
  confirmed: Package,
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  completed: 'text-green-600',
  cancelled: 'text-red-600',
  paid: 'text-green-600',
  failed: 'text-red-600',
}

export default function MyOrdersPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [verifying, setVerifying] = useState(!!token)
  const [error, setError] = useState('')

  // If token is present, verify it
  useEffect(() => {
    if (!token) return
    setVerifying(true)
    fetch(`/api/orders/verify?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders)
          setVerifiedEmail(data.email)
        } else {
          setError(data.error || 'Invalid or expired link')
        }
      })
      .catch(() => setError('Failed to verify link'))
      .finally(() => setVerifying(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setMessage(data.message || 'Check your email for a link to view your orders.')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state when verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your link...</p>
        </div>
      </div>
    )
  }

  // Show orders if verified
  if (verifiedEmail && orders.length >= 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-primary-500 text-white section-padding">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Orders</h1>
            <p className="text-xl text-blue-100">{verifiedEmail}</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-custom max-w-4xl">
            {orders.length === 0 ? (
              <div className="card text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">You haven't placed any orders with us yet.</p>
                <Link href="/services" className="btn-primary inline-block">Browse Services</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.orderStatus] || Clock
                  return (
                    <div key={order.id} className="card">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <span className="font-mono text-sm text-gray-500">{order.id}</span>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1 text-sm font-medium ${STATUS_COLORS[order.orderStatus]}`}>
                            <StatusIcon className="w-4 h-4" />
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                          <span className={`text-sm font-medium ${STATUS_COLORS[order.paymentStatus]}`}>
                            Payment: {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div className="text-sm text-gray-600">
                          <span>Appointment: {order.date} at {order.time}</span>
                          <span className="ml-4">Payment: {order.paymentMethod}</span>
                        </div>
                        <span className="text-lg font-bold text-primary-500">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  // Email form (default view)
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">My Orders</h1>
          <p className="text-xl text-blue-100">Enter your email to view your order history</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-md">
          <div className="card">
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" role="alert">
                {error}
                <p className="text-sm mt-1">Please request a new link below.</p>
              </div>
            )}

            {message ? (
              <div className="text-center py-6">
                <Mail className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-600">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send me a link'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  We'll send a secure link to your email so you can view your orders.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
