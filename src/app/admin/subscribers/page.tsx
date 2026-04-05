'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Users, Download } from 'lucide-react'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  locale: string
  subscribedAt: string
  active: boolean
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])

  const loadSubscribers = useCallback(async () => {
    const res = await fetch('/api/subscribers')
    const data = await res.json()
    setSubscribers(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { loadSubscribers() }, [loadSubscribers])

  const activeCount = subscribers.filter(s => s.active).length

  const exportCSV = () => {
    const active = subscribers.filter(s => s.active)
    const csv = ['Email,Language,Subscribed Date']
      .concat(active.map(s => `${s.email},${s.locale},${s.subscribedAt}`))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <Mail className="w-10 h-10 mr-3" />
                Email Subscribers
              </h1>
              <p className="text-blue-100">{activeCount} active subscribers</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={exportCSV} className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <Link href="/admin" className="btn-secondary">Back to Admin</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{subscribers.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="card text-center">
              <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
            <div className="card text-center">
              <Mail className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{subscribers.length - activeCount}</p>
              <p className="text-sm text-gray-500">Unsubscribed</p>
            </div>
          </div>

          {/* Subscriber List */}
          {subscribers.length === 0 ? (
            <div className="card text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No subscribers yet.</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Language</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map(sub => (
                    <tr key={sub.id} className={!sub.active ? 'opacity-50' : ''}>
                      <td className="px-6 py-4 text-sm">{sub.email}</td>
                      <td className="px-6 py-4 text-sm uppercase">{sub.locale}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sub.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
