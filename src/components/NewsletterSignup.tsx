'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function NewsletterSignup() {
  const { locale } = useLanguage()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })
      const data = await res.json()

      if (data.success) {
        setStatus('success')
        setMessage(locale === 'es' ? 'Te has suscrito exitosamente!' : 'Successfully subscribed!')
        setEmail('')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setStatus('error')
      setMessage('Connection error. Please try again.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {locale === 'es' ? 'Ofertas y novedades' : 'Deals & Updates'}
      </h4>
      <p className="text-gray-400 text-sm mb-3">
        {locale === 'es'
          ? 'Recibe ofertas exclusivas y noticias.'
          : 'Get exclusive deals and news.'}
      </p>

      {status === 'success' ? (
        <div className="flex items-center space-x-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === 'es' ? 'Tu email' : 'Your email'}
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={status === 'loading'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              locale === 'es' ? 'Suscribir' : 'Subscribe'
            )}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-1">{message}</p>
      )}
    </div>
  )
}
