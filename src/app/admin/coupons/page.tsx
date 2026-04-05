'use client'

import { useState, useEffect, useCallback } from 'react'
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase: number
  maxUses: number
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  description: string
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minPurchase: '',
    maxUses: '',
    expiresAt: '',
    description: '',
  })

  const loadCoupons = useCallback(async () => {
    const res = await fetch('/api/coupons')
    const data = await res.json()
    setCoupons(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { loadCoupons() }, [loadCoupons])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setShowForm(false)
      setForm({ code: '', type: 'percentage', value: '', minPurchase: '', maxUses: '', expiresAt: '', description: '' })
      loadCoupons()
    } else {
      alert(data.error || 'Error creating coupon')
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
    })
    loadCoupons()
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    loadCoupons()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Ticket className="w-10 h-10 mr-3" />
                Coupon Management
              </h1>
              <p className="text-amber-100">Create and manage discount codes</p>
            </div>
            <Link href="/admin" className="btn-secondary">Back to Admin</Link>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center mb-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Create Coupon'}
          </button>

          {showForm && (
            <form onSubmit={handleCreate} className="card mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="HYBRID10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Value ({form.type === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={form.type === 'percentage' ? '100' : '10000'}
                    value={form.value}
                    onChange={e => setForm({ ...form, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Purchase ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minPurchase}
                    onChange={e => setForm({ ...form, minPurchase: e.target.value })}
                    placeholder="0 = no minimum"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxUses}
                    onChange={e => setForm({ ...form, maxUses: e.target.value })}
                    placeholder="0 = unlimited"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expires At</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="10% off all batteries"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
              <button type="submit" className="btn-primary">Create Coupon</button>
            </form>
          )}

          <div className="space-y-4">
            {coupons.length === 0 ? (
              <div className="card text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No coupons yet. Create your first one!</p>
              </div>
            ) : (
              coupons.map(coupon => (
                <div key={coupon.id} className={`card flex items-center justify-between ${!coupon.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-lg font-bold font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                        {coupon.code}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                      {coupon.minPurchase > 0 && ` | Min: $${coupon.minPurchase}`}
                      {coupon.maxUses > 0 && ` | Uses: ${coupon.usedCount}/${coupon.maxUses}`}
                      {coupon.expiresAt && ` | Expires: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                    </p>
                    {coupon.description && <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => toggleActive(coupon)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Toggle active">
                      {coupon.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500" title="Delete">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
