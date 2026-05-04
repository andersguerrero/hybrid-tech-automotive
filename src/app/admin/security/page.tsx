'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldOff, ArrowLeft } from 'lucide-react'

type AuthCheck = {
  authenticated: boolean
  user?: { id: string; email: string; role: string; totpEnabled: boolean }
}

type SetupResponse = {
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
}

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthCheck['user'] | null>(null)
  const [setupData, setSetupData] = useState<SetupResponse | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = async () => {
    setError('')
    const res = await fetch('/api/auth/check')
    const data: AuthCheck = await res.json()
    if (!data.authenticated) {
      window.location.href = '/admin/login'
      return
    }
    setUser(data.user ?? null)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const startSetup = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/auth/2fa/setup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to start setup')
        return
      }
      setSetupData(data)
    } finally {
      setBusy(false)
    }
  }

  const verifySetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code')
        return
      }
      setMessage('2FA enabled successfully.')
      setSetupData(null)
      setVerifyCode('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  const disable2fa = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to disable 2FA')
        return
      }
      setMessage('2FA has been disabled.')
      setDisablePassword('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-2xl">
        <Link
          href="/admin"
          className="inline-flex items-center text-gray-600 hover:text-primary-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to admin
        </Link>

        <div className="card">
          <div className="flex items-center mb-6">
            <ShieldCheck className="w-8 h-8 text-primary-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security</h1>
              <p className="text-gray-600 text-sm">
                Signed in as <span className="font-mono">{user?.email}</span>
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <h2 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>

          {user?.totpEnabled ? (
            <>
              <p className="text-gray-700 mb-4">
                2FA is <span className="font-semibold text-green-700">enabled</span> for your account.
              </p>
              <form onSubmit={disable2fa} className="space-y-4">
                <p className="text-sm text-gray-600">
                  To disable 2FA, confirm your password:
                </p>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Current password"
                  required
                  autoComplete="current-password"
                  disabled={busy}
                />
                <button
                  type="submit"
                  disabled={busy || !disablePassword}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <ShieldOff className="w-4 h-4 mr-2" />
                  Disable 2FA
                </button>
              </form>
            </>
          ) : !setupData ? (
            <>
              <p className="text-gray-700 mb-4">
                2FA adds a second step to login using an authenticator app such as
                Google Authenticator, 1Password, or Authy.
              </p>
              <button
                onClick={startSetup}
                disabled={busy}
                className="btn-primary disabled:opacity-50"
              >
                {busy ? 'Starting…' : 'Enable 2FA'}
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-2">
                Scan this QR code with your authenticator app, then enter the
                6-digit code below to confirm.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrCodeDataUrl}
                alt="TOTP QR code"
                className="border border-gray-200 rounded-lg my-4"
                width={240}
                height={240}
              />
              <details className="mb-4 text-sm text-gray-600">
                <summary className="cursor-pointer">Can&apos;t scan? Enter the secret manually</summary>
                <code className="block mt-2 p-2 bg-gray-100 rounded font-mono break-all">
                  {setupData.secret}
                </code>
              </details>
              <form onSubmit={verifySetup} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-widest text-center"
                  placeholder="123456"
                  required
                  autoComplete="one-time-code"
                  autoFocus
                  disabled={busy}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={busy || verifyCode.length !== 6}
                    className="btn-primary disabled:opacity-50"
                  >
                    {busy ? 'Verifying…' : 'Verify and enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupData(null)
                      setVerifyCode('')
                      setError('')
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                    disabled={busy}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
