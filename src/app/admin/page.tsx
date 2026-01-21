'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Settings, 
  DollarSign, 
  Palette, 
  FileText, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Lock,
  ImageIcon,
  Star,
  Type
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

export default function AdminPage() {
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    // Verificar si está autenticado
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      setPasswordError('')
    } else {
      setPasswordError(t.admin.wrongPassword)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    setPassword('')
  }

  // Si no está autenticado, mostrar formulario de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="card">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-primary-500" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t.admin.loginTitle}
              </h1>
              <p className="text-gray-600">
                {t.admin.loginSubtitle}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.passwordLabel}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.admin.passwordPlaceholder}
                  required
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full btn-primary"
              >
                {t.admin.loginButton}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="block text-center text-gray-600 hover:text-primary-500 transition-colors"
              >
                {t.admin.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const adminSections = [
    {
      title: t.admin.priceManagement,
      description: t.admin.priceDesc,
      icon: DollarSign,
      href: '/prices',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t.admin.contactInfo,
      description: t.admin.contactDesc,
      icon: Phone,
      href: '/admin/contact',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t.admin.businessHours,
      description: t.admin.hoursDesc,
      icon: Clock,
      href: '/admin/hours',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: t.admin.blog,
      description: t.admin.blogDesc,
      icon: FileText,
      href: '/admin/blog',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: t.admin.services,
      description: t.admin.servicesDesc,
      icon: Settings,
      href: '/admin/services',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      title: t.admin.batteries,
      description: t.admin.batteriesDesc,
      icon: DollarSign,
      href: '/admin/batteries',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      title: 'Battery Images',
      description: 'Manage 17 unique battery images shared across all models',
      icon: ImageIcon,
      href: '/admin/battery-images',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      title: t.admin.images,
      description: t.admin.imagesDesc,
      icon: ImageIcon,
      href: '/admin/images',
      color: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      title: t.admin.reviews,
      description: t.admin.reviewsDesc,
      icon: Star,
      href: '/admin/reviews',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      title: t.admin.texts || 'Content Management',
      description: t.admin.textsDesc || 'Edit all texts and content',
      icon: Type,
      href: '/admin/texts',
      color: 'bg-teal-500 hover:bg-teal-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
                <Settings className="w-12 h-12 mr-4" />
                {t.admin.panelTitle}
              </h1>
              <p className="text-xl text-blue-100">
                {t.admin.panelSubtitle}
              </p>
            </div>
            <Link 
              href="/"
              className="hidden md:block btn-secondary"
            >
              {t.admin.viewSite}
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Sections */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.title}
                  href={section.href || '#'}
                  className="group card hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 ${section.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {section.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="section-padding bg-gray-100">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2" />
                {t.admin.security}
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  • {t.admin.sessionActive}
                </p>
                <p>
                  • {t.admin.logoutWhenDone}
                </p>
                <p>
                  • {t.admin.autoSave}
                </p>
                <p>
                  • {t.admin.changePassword}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t.admin.logout}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

