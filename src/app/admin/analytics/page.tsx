'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, ShoppingCart, Package, DollarSign, TrendingUp, Users, Eye } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  items: { name: string; price: number; quantity: number; type: string }[]
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  paidOrders: number
  pendingOrders: number
  topItems: { name: string; count: number; revenue: number }[]
  ordersByMonth: { month: string; count: number; revenue: number }[]
  paymentMethods: { method: string; count: number }[]
  recentOrders: Order[]
}

function computeAnalytics(orders: Order[]): AnalyticsData {
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid')
  const pendingOrders = orders.filter(o => o.paymentStatus === 'pending')

  // Top items
  const itemMap = new Map<string, { count: number; revenue: number }>()
  orders.forEach(order => {
    order.items?.forEach(item => {
      const key = item.name
      const existing = itemMap.get(key) || { count: 0, revenue: 0 }
      existing.count += item.quantity
      existing.revenue += item.price * item.quantity
      itemMap.set(key, existing)
    })
  })
  const topItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Orders by month
  const monthMap = new Map<string, { count: number; revenue: number }>()
  orders.forEach(order => {
    const date = new Date(order.createdAt)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const existing = monthMap.get(month) || { count: 0, revenue: 0 }
    existing.count += 1
    existing.revenue += order.total || 0
    monthMap.set(month, existing)
  })
  const ordersByMonth = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Payment methods
  const pmMap = new Map<string, number>()
  orders.forEach(order => {
    const m = order.paymentMethod || 'unknown'
    pmMap.set(m, (pmMap.get(m) || 0) + 1)
  })
  const paymentMethods = Array.from(pmMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return {
    totalOrders: orders.length,
    totalRevenue,
    avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    paidOrders: paidOrders.length,
    pendingOrders: pendingOrders.length,
    topItems,
    ordersByMonth,
    paymentMethods,
    recentOrders: orders.slice(0, 5),
  }
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      const orders = Array.isArray(data) ? data : data.orders || []
      setAnalytics(computeAnalytics(orders))
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    )
  }

  if (!analytics) return null
  const { totalOrders, totalRevenue, avgOrderValue, paidOrders, pendingOrders, topItems, ordersByMonth, paymentMethods } = analytics

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-violet-600 to-purple-600 text-white section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <BarChart3 className="w-10 h-10 mr-3" />
                Analytics Dashboard
              </h1>
              <p className="text-violet-100">Business metrics and insights</p>
            </div>
            <Link href="/admin" className="btn-secondary">Back to Admin</Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="card text-center">
              <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{totalOrders}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
            <div className="card text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">${avgOrderValue.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Avg Order Value</p>
            </div>
            <div className="card text-center">
              <ShoppingCart className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{paidOrders}</p>
              <p className="text-sm text-gray-500">Paid Orders</p>
            </div>
            <div className="card text-center">
              <Eye className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold">{pendingOrders}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
                Top Products & Services
              </h2>
              {topItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-sm font-semibold">${item.revenue.toFixed(0)}</span>
                        <span className="text-xs text-gray-500 ml-2">({item.count}x)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders by Month */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                Monthly Revenue
              </h2>
              {ordersByMonth.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {ordersByMonth.map((month) => {
                    const maxRevenue = Math.max(...ordersByMonth.map(m => m.revenue))
                    const width = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                    return (
                      <div key={month.month}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{month.month}</span>
                          <span className="text-gray-500">${month.revenue.toFixed(0)} ({month.count} orders)</span>
                        </div>
                        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-500" />
                Payment Methods
              </h2>
              {paymentMethods.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((pm) => (
                    <div key={pm.method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium capitalize">{pm.method}</span>
                      <span className="text-lg font-bold">{pm.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Quick Links</h2>
              <div className="space-y-3">
                <Link href="/admin/orders" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span>View All Orders</span>
                  <Package className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/admin/coupons" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span>Manage Coupons</span>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/admin/subscribers" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span>Email Subscribers</span>
                  <Users className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
