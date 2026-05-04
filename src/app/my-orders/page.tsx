'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Mail, Package, Clock, CheckCircle, XCircle, Loader2,
  Shield, Calendar, Wrench, MessageCircle, Phone,
  ChevronRight, AlertTriangle, ArrowRight, LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Order, OrderItem } from '@/types'

// --- Status maps ---
const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  completed: CheckCircle,
  cancelled: XCircle,
  pending: Clock,
  confirmed: Package,
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

// --- Warranty helpers ---
interface WarrantyInfo {
  itemName: string
  orderDate: string
  expiryDate: Date
  status: 'active' | 'expiring' | 'expired'
  daysLeft: number
}

function getWarrantyInfo(order: Order): WarrantyInfo[] {
  const warranties: WarrantyInfo[] = []
  for (const item of order.items) {
    if (item.type === 'battery') {
      const orderDate = new Date(order.createdAt)
      const expiryDate = new Date(orderDate)
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
      const now = new Date()
      const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      let status: WarrantyInfo['status'] = 'active'
      if (daysLeft <= 0) status = 'expired'
      else if (daysLeft <= 30) status = 'expiring'
      warranties.push({
        itemName: item.name,
        orderDate: order.createdAt,
        expiryDate,
        status,
        daysLeft,
      })
    }
  }
  return warranties
}

function getWarrantyBadgeClasses(status: WarrantyInfo['status']): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'expiring': return 'bg-yellow-100 text-yellow-800'
    case 'expired': return 'bg-red-100 text-red-800'
  }
}

// --- Maintenance recommendations ---
interface MaintenanceRec {
  message: string
  priority: 'high' | 'medium' | 'low'
}

function getMaintenanceRecommendations(
  orders: Order[],
  t: ReturnType<typeof useLanguage>['t']
): MaintenanceRec[] {
  const recs: MaintenanceRec[] = []
  if (orders.length === 0) {
    recs.push({ message: t.dashboard.scheduleNext, priority: 'low' })
    return recs
  }

  const now = new Date()
  const completedOrders = orders
    .filter(o => o.orderStatus === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (completedOrders.length > 0) {
    const lastService = new Date(completedOrders[0].createdAt)
    const monthsSinceLast = (now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24 * 30)

    const hasBatteryService = completedOrders.some(o =>
      o.items.some((item: OrderItem) => item.type === 'battery')
    )

    if (hasBatteryService && monthsSinceLast > 6) {
      recs.push({ message: t.dashboard.batteryHealthCheck, priority: 'high' })
    }
    if (monthsSinceLast > 12) {
      recs.push({ message: t.dashboard.annualDiagnostic, priority: 'high' })
    }
  }

  recs.push({ message: t.dashboard.scheduleNext, priority: 'low' })
  return recs
}

// --- Tab type ---
type TabId = 'orders' | 'warranties' | 'appointments' | 'maintenance'

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <MyOrdersPageInner />
    </Suspense>
  )
}

function MyOrdersPageInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [verifying, setVerifying] = useState(!!token)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabId>('orders')

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

  // Derived data
  const allWarranties = useMemo(() => {
    return orders.flatMap(order => getWarrantyInfo(order))
  }, [orders])

  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return orders.filter(order => {
      if (order.orderStatus === 'cancelled') return false
      const appointmentDate = new Date(`${order.date}T${order.time || '00:00'}`)
      return appointmentDate >= now
    }).sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
  }, [orders])

  const recommendations = useMemo(() => {
    return getMaintenanceRecommendations(orders, t)
  }, [orders, t])

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

  const handleSignOut = () => {
    setVerifiedEmail('')
    setOrders([])
    setError('')
    setActiveTab('orders')
    // Clear the token from the URL
    window.history.replaceState({}, '', '/my-orders')
  }

  // --- Loading state ---
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  // --- Dashboard view (verified) ---
  if (verifiedEmail && !error) {
    const tabs: { id: TabId; label: string; icon: typeof Package; count?: number }[] = [
      { id: 'orders', label: t.dashboard.orderHistory, icon: Package, count: orders.length },
      { id: 'warranties', label: t.dashboard.activeWarranties, icon: Shield, count: allWarranties.filter(w => w.status !== 'expired').length },
      { id: 'appointments', label: t.dashboard.upcomingAppointments, icon: Calendar, count: upcomingAppointments.length },
      { id: 'maintenance', label: t.dashboard.recommendations, icon: Wrench, count: recommendations.length },
    ]

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-primary-500 text-white section-padding">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-1">{t.dashboard.title}</h1>
                <p className="text-blue-100">{t.dashboard.viewingAs}: {verifiedEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors self-start sm:self-auto"
              >
                <LogOut className="w-4 h-4" />
                {t.dashboard.backToLookup}
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="container-custom -mt-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/booking"
              className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
            >
              <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{t.dashboard.bookNew}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </Link>
            <Link
              href="/contact"
              className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
            >
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{t.dashboard.contactUs}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            </Link>
            <a
              href="https://wa.me/18327625299"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow group"
            >
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{t.dashboard.whatsappChat}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            </a>
          </div>
        </section>

        {/* Tabs */}
        <section className="container-custom mt-8">
          <div className="flex overflow-x-auto gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="pb-12">
            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm text-center py-12 px-6">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.dashboard.noOrdersYet}</h2>
                    <p className="text-gray-600 mb-6">{t.dashboard.noOrdersDesc}</p>
                    <Link href="/services" className="btn-primary inline-block">{t.dashboard.browseServices}</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const StatusIcon = STATUS_ICONS[order.orderStatus] || Clock
                      const orderWarranties = getWarrantyInfo(order)
                      return (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div>
                              <span className="font-mono text-sm text-gray-500">{order.id}</span>
                              <p className="text-sm text-gray-500">
                                {t.dashboard.orderDate}: {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.orderStatus]}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                              <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.paymentStatus]}`}>
                                {t.dashboard.payment}: {order.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.quantity}x {item.name}
                                  {item.type === 'battery' && (
                                    <Shield className="w-3.5 h-3.5 text-green-500 inline ml-1.5" />
                                  )}
                                </span>
                                <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Warranty indicators */}
                          {orderWarranties.length > 0 && (
                            <div className="mb-4 space-y-1">
                              {orderWarranties.map((w, i) => (
                                <div key={i} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mr-2 ${getWarrantyBadgeClasses(w.status)}`}>
                                  <Shield className="w-3 h-3" />
                                  {t.dashboard.yearWarranty} &mdash;{' '}
                                  {w.status === 'expired'
                                    ? t.dashboard.warrantyExpired
                                    : `${t.dashboard.expiresOn} ${w.expiryDate.toLocaleDateString()}`
                                  }
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="border-t pt-3 flex flex-col sm:flex-row sm:justify-between gap-2">
                            <div className="text-sm text-gray-600">
                              <span>{t.dashboard.appointment}: {order.date} {order.time && `- ${order.time}`}</span>
                              <span className="ml-4">{t.dashboard.payment}: {order.paymentMethod}</span>
                            </div>
                            <span className="text-lg font-bold text-primary-500">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Warranties tab */}
            {activeTab === 'warranties' && (
              <div>
                {allWarranties.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm text-center py-12 px-6">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t.dashboard.noWarranties}</h2>
                    <p className="text-gray-500">{t.dashboard.noOrdersDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allWarranties.map((warranty, i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${
                              warranty.status === 'active' ? 'bg-green-100' :
                              warranty.status === 'expiring' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <Shield className={`w-6 h-6 ${
                                warranty.status === 'active' ? 'text-green-600' :
                                warranty.status === 'expiring' ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{t.dashboard.yearWarranty}</h3>
                              <p className="text-sm text-gray-600">{t.dashboard.warrantyFor} {warranty.itemName}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {t.dashboard.orderDate}: {new Date(warranty.orderDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full ${getWarrantyBadgeClasses(warranty.status)}`}>
                              {warranty.status === 'active' && t.dashboard.warrantyActive}
                              {warranty.status === 'expiring' && t.dashboard.warrantyExpiring}
                              {warranty.status === 'expired' && t.dashboard.warrantyExpired}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              {warranty.status !== 'expired'
                                ? `${t.dashboard.expiresOn}: ${warranty.expiryDate.toLocaleDateString()} (${warranty.daysLeft} ${t.dashboard.daysLeft})`
                                : t.dashboard.warrantyExpired
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Appointments tab */}
            {activeTab === 'appointments' && (
              <div>
                {upcomingAppointments.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm text-center py-12 px-6">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{t.dashboard.noAppointments}</h2>
                    <Link href="/booking" className="btn-primary inline-flex items-center gap-2 mt-4">
                      <Calendar className="w-4 h-4" />
                      {t.dashboard.bookNew}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(order => (
                      <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-primary-100 text-primary-600 p-3 rounded-lg">
                              <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {order.date} {order.time && `- ${order.time}`}
                              </h3>
                              <div className="text-sm text-gray-600 mt-1">
                                {order.items.map(item => item.name).join(', ')}
                              </div>
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 ${STATUS_COLORS[order.orderStatus]}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary-500">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Maintenance tab */}
            {activeTab === 'maintenance' && (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${
                        rec.priority === 'high' ? 'bg-red-100' :
                        rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {rec.priority === 'high' ? (
                          <AlertTriangle className={`w-6 h-6 text-red-600`} />
                        ) : (
                          <Wrench className={`w-6 h-6 ${
                            rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{rec.message}</p>
                      </div>
                      <Link
                        href="/booking"
                        className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-medium whitespace-nowrap"
                      >
                        {t.dashboard.bookNew}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  // --- Email form (default/login view) ---
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.dashboard.title}</h1>
          <p className="text-xl text-blue-100">{t.dashboard.orderHistory}</p>
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
                  We&apos;ll send a secure link to your email so you can view your orders.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
