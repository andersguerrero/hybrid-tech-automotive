'use client'

import Link from 'next/link'
import {
  Settings,
  DollarSign,
  FileText,
  Clock,
  Phone,
  ImageIcon,
  Star,
  Package,
  Ticket,
  BarChart3,
  Users,
  ShieldCheck
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminPage() {
  const { t } = useLanguage()

  const adminSections = [
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: Package,
      href: '/admin/orders',
      color: 'bg-emerald-500 hover:bg-emerald-600'
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
      title: 'Analytics',
      description: 'Revenue, top products, and business metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-violet-500 hover:bg-violet-600'
    },
    {
      title: 'Coupons',
      description: 'Create and manage discount codes',
      icon: Ticket,
      href: '/admin/coupons',
      color: 'bg-amber-500 hover:bg-amber-600'
    },
    {
      title: 'Subscribers',
      description: 'Newsletter email subscribers',
      icon: Users,
      href: '/admin/subscribers',
      color: 'bg-rose-500 hover:bg-rose-600'
    },
    {
      title: 'Security',
      description: 'Manage two-factor authentication',
      icon: ShieldCheck,
      href: '/admin/security',
      color: 'bg-slate-600 hover:bg-slate-700'
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

    </div>
  )
}

