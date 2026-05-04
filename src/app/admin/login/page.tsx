'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [needsTotp, setNeedsTotp] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const body: Record<string, string> = { email, password }
      if (needsTotp && totpCode) body.totpCode = totpCode

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.removeItem('admin_authenticated')
        router.push('/admin')
        return
      }

      if (data.totpRequired) {
        setNeedsTotp(true)
        setError(needsTotp ? data.error || 'Invalid code' : '')
        return
      }

      setError(data.error || 'Invalid credentials')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container-custom max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              {needsTotp
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Sign in with your admin email and password'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="admin@example.com"
                required
                autoComplete="email"
                disabled={isLoading || needsTotp}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                disabled={isLoading || needsTotp}
              />
            </div>

            {needsTotp && (
              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Authenticator code
                </label>
                <input
                  type="text"
                  id="totpCode"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-widest text-center"
                  placeholder="123456"
                  autoComplete="one-time-code"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : needsTotp ? 'Verify' : 'Sign In'}
            </button>

            {needsTotp && (
              <button
                type="button"
                onClick={() => {
                  setNeedsTotp(false)
                  setTotpCode('')
                  setError('')
                }}
                className="w-full text-sm text-gray-600 hover:text-primary-500"
              >
                ← Use a different account
              </button>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="block text-center text-gray-600 hover:text-primary-500 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
