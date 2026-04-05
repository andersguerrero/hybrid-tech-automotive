'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone, Calendar, ShoppingCart, Moon, Sun } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSiteImages } from '@/hooks/useData'
import { useCart } from '@/contexts/CartContext'
import { useTheme } from '@/contexts/ThemeContext'
import Cart from '@/components/Cart'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { locale, setLocale, t } = useLanguage()
  const siteImages = useSiteImages()
  const { getTotalItems } = useCart()
  const { theme, toggleTheme } = useTheme()
  const cartItemsCount = getTotalItems()

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.services, href: '/services' },
    { name: t.nav.batteries, href: '/batteries' },
    { name: t.nav.reviews, href: '/reviews' },
    { name: t.nav.blog, href: '/blog' },
    { name: t.nav.contact, href: '/contact' },
  ]

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-primary-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to content
      </a>

      <div className="container-custom">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="h-16 w-auto">
              <Image
                src={siteImages.logo || "/logo.jpg"}
                alt="Hybrid Tech Auto Logo"
                width={180}
                height={64}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 mx-6 flex-1" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 dark:text-gray-200 hover:text-primary-500 font-medium transition-colors text-sm"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Shopping Cart */}
            {cartItemsCount > 0 ? (
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50"
                aria-label={`Shopping cart, ${cartItemsCount} items`}
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                <span
                  className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  aria-hidden="true"
                >
                  {cartItemsCount}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              </button>
            )}

            {/* Phone - Icon only */}
            <a
              href="tel:+18327625299"
              className="p-2 text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Call (832) 762-5299"
            >
              <Phone className="w-5 h-5" aria-hidden="true" />
            </a>

            {/* Language Switcher - Compact */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden" role="group" aria-label="Language switcher">
              <button
                onClick={() => setLocale('en')}
                aria-label="Switch to English"
                aria-pressed={locale === 'en'}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLocale('es')}
                aria-label="Cambiar a Español"
                aria-pressed={locale === 'es'}
                className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  locale === 'es'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                ES
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Primary CTA */}
            <Link
              href="/booking"
              className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>Book Now</span>
            </Link>
          </div>

          {/* Mobile: Actions + Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Mobile Cart */}
            {cartItemsCount > 0 ? (
              <Link
                href="/cart"
                className="relative p-2 text-gray-700"
                aria-label={`Shopping cart, ${cartItemsCount} items`}
              >
                <ShoppingCart className="w-6 h-6" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" aria-hidden="true">
                  {cartItemsCount}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="w-6 h-6" aria-hidden="true" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200" id="mobile-navigation">
            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-500 font-medium transition-colors py-2.5 px-4 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
                {/* Primary CTA */}
                <Link
                  href="/booking"
                  className="btn-primary flex items-center justify-center space-x-2 w-full py-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Book Now</span>
                </Link>

                {/* Utilities Row */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Phone */}
                  <a
                    href="tel:+18327625299"
                    className="flex flex-col items-center justify-center p-3 text-gray-700 dark:text-gray-200 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    aria-label="Call (832) 762-5299"
                  >
                    <Phone className="w-5 h-5 mb-1" aria-hidden="true" />
                    <span className="text-xs">Call</span>
                  </a>

                  {/* Dark Mode */}
                  <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center p-3 text-gray-700 dark:text-gray-200 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5 mb-1" /> : <Moon className="w-5 h-5 mb-1" />}
                    <span className="text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                  </button>

                  {/* Language */}
                  <div className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg" role="group" aria-label="Language switcher">
                    <span className="text-xs text-gray-600 mb-2">Language</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setLocale('en')}
                        aria-label="Switch to English"
                        aria-pressed={locale === 'en'}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          locale === 'en'
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-700 bg-gray-100'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLocale('es')}
                        aria-label="Cambiar a Español"
                        aria-pressed={locale === 'es'}
                        className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                          locale === 'es'
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-700 bg-gray-100'
                        }`}
                      >
                        ES
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
