'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Settings, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false)
      return
    }

    localStorage.removeItem('admin_authenticated')

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, isLoginPage])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
    }
  }

  // Login page renders without the admin layout wrapper
  if (isLoginPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom flex items-center justify-between py-4">
          <Link href="/admin" className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
