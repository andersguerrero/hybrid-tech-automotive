'use client'

import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import type { Order } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

const ORDER_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch {
      console.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (orderId: string, field: 'orderStatus' | 'paymentStatus', value: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, [field]: value }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o))
      }
    } catch {
      console.error('Failed to update order')
    }
  }

  const filtered = orders.filter(o => {
    if (filterStatus !== 'all' && o.orderStatus !== filterStatus) return false
    if (filterPayment !== 'all' && o.paymentStatus !== filterPayment) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white section-padding">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <Package className="w-10 h-10 mr-3" />
            Order Management
          </h1>
          <p className="text-blue-100">View and manage all customer orders</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {/* Filters */}
          <div className="card mb-6 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Order Status:</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Payment:</label>
              <select
                value={filterPayment}
                onChange={e => setFilterPayment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All</option>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <button onClick={fetchOrders} className="ml-auto btn-outline flex items-center text-sm px-3 py-1.5">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No orders found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(order => (
                <div key={order.id} className="card">
                  {/* Summary Row */}
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-mono text-sm text-gray-500">{order.id}</span>
                      <span className="font-semibold text-gray-900">{order.customerName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                      <span className="font-bold text-primary-500">${order.total.toFixed(2)}</span>
                    </div>
                    {expandedId === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  {/* Expanded Details */}
                  {expandedId === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Customer</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        <p className="text-sm text-gray-600">{order.customerPhone}</p>

                        <h4 className="font-semibold text-gray-900 mt-4 mb-2">Appointment</h4>
                        <p className="text-sm text-gray-600">Date: {order.date}</p>
                        <p className="text-sm text-gray-600">Time: {order.time}</p>
                        {order.comments && <p className="text-sm text-gray-600">Notes: {order.comments}</p>}
                        <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                        {order.stripeSessionId && <p className="text-sm text-gray-500 font-mono">Stripe: {order.stripeSessionId.slice(0, 20)}...</p>}
                        <p className="text-xs text-gray-400 mt-2">Created: {new Date(order.createdAt).toLocaleString()}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{item.quantity}x {item.name}</span>
                              <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 space-y-1">
                            <div className="flex justify-between text-sm"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                            {order.tax > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>}
                            <div className="flex justify-between font-bold"><span>Total</span><span className="text-primary-500">${order.total.toFixed(2)}</span></div>
                          </div>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2">Update Status</h4>
                        <div className="flex gap-3">
                          <div>
                            <label className="text-xs text-gray-500">Order</label>
                            <select
                              value={order.orderStatus}
                              onChange={e => handleStatusChange(order.id, 'orderStatus', e.target.value)}
                              className="block border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Payment</label>
                            <select
                              value={order.paymentStatus}
                              onChange={e => handleStatusChange(order.id, 'paymentStatus', e.target.value)}
                              className="block border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
