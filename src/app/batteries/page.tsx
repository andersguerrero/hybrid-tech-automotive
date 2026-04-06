'use client'

import { useState, useEffect, useCallback } from 'react'
import BatteryCard from '@/components/BatteryCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { Battery } from '@/types'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2, GitCompareArrows } from 'lucide-react'
import { useContactInfo } from '@/hooks/useData'

const PAGE_SIZE = 12

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface FacetsInfo {
  brands: string[]
  models: string[]
  conditions: string[]
  priceRange: { min: number; max: number }
}

export default function BatteriesPage() {
  const { t } = useLanguage()
  const contact = useContactInfo()

  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedCondition, setSelectedCondition] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [sortBy, setSortBy] = useState<string>('vehicle')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Data states
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [previousPrices, setPreviousPrices] = useState<Record<string, number>>({})
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [facets, setFacets] = useState<FacetsInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch batteries from API
  const fetchBatteries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('limit', String(PAGE_SIZE))
      params.set('sort', sortBy)
      params.set('order', sortOrder)
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (selectedBrand) params.set('brand', selectedBrand)
      if (selectedModel) params.set('model', selectedModel)
      if (selectedCondition) params.set('condition', selectedCondition)

      const res = await fetch(`/api/batteries?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setBatteries(data.batteries)
        setPreviousPrices(data.previousPrices || {})
        setPagination(data.pagination)
        setFacets(data.facets)
      }
    } catch (error) {
      console.error('Error fetching batteries:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch, selectedBrand, selectedModel, selectedCondition, sortBy, sortOrder])

  useEffect(() => {
    fetchBatteries()
  }, [fetchBatteries])

  // Reset page on filter change
  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedModel('')
    setCurrentPage(1)
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
    setCurrentPage(1)
  }

  const handleConditionChange = (condition: string) => {
    setSelectedCondition(condition)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    const [field, ord] = value.split('-')
    setSortBy(field)
    setSortOrder(ord as 'asc' | 'desc')
    setCurrentPage(1)
  }

  // No brand grouping — pagination already sorts batteries by the selected order.
  // Grouping by brand within a paginated page causes confusing layouts
  // (e.g., page 2 mixing Honda and Lexus with forced brand reordering).

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.batteriesPage.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.batteriesPage.heroDescription}
          </p>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-8 bg-white sticky top-[72px] z-10 border-b">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.batteries.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.batteries.filterBrand}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t.batteries.allBrands}</option>
                  {facets?.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.batteries.filterModel}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t.batteries.allModels}</option>
                  {facets?.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.batteries.filterCondition}
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t.batteries.allConditions}</option>
                  <option value="new">{t.batteries.newBattery}</option>
                  <option value="refurbished">{t.batteries.refurbishedBattery}</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SlidersHorizontal className="inline w-4 h-4 mr-1" />
                  Sort By
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="vehicle-asc">Vehicle A-Z</option>
                  <option value="vehicle-desc">Vehicle Z-A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Compare Link + Results Count */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <Link
                href="/batteries/compare"
                className="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium"
              >
                <GitCompareArrows className="w-4 h-4 mr-1" />
                Compare Batteries
              </Link>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <p>
                {pagination ? (
                  pagination.total === 0
                    ? t.batteries.noResults
                    : `${pagination.total} ${t.batteries.resultsFound}`
                ) : ''}
              </p>
              {pagination && pagination.totalPages > 1 && (
                <p>
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="pt-8 pb-16 bg-white">
          <div className="container-custom">
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
          </div>
        </section>
      )}

      {/* Batteries Grid */}
      {!loading && batteries.length > 0 && (
        <section className="pt-6 pb-8 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {batteries.map((battery) => (
                <BatteryCard key={battery.id} battery={battery} previousPrice={previousPrices[battery.id]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No Results */}
      {!loading && batteries.length === 0 && (
        <section className="pt-8 pb-16 bg-white">
          <div className="container-custom text-center py-12">
            <p className="text-xl text-gray-500">{t.batteries.noResults}</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedBrand('')
                setSelectedModel('')
                setSelectedCondition('')
                setCurrentPage(1)
              }}
              className="mt-4 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        </section>
      )}

      {/* Pagination */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <section className="py-8 bg-white border-t">
          <div className="container-custom">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => {
                  // Show first, last, current, and neighbors
                  return p === 1 || p === pagination.totalPages ||
                    Math.abs(p - pagination.page) <= 1
                })
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) {
                    acc.push('...')
                  }
                  acc.push(p)
                  return acc
                }, [])
                .map((item, i) =>
                  typeof item === 'string' ? (
                    <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        item === pagination.page
                          ? 'bg-primary-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Warranty Info */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t.batteriesPage.warrantyTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-500">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty1Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty1Desc}</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-secondary-500">&#10003;</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty2Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty2Desc}</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-500">24/7</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty3Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.batteriesPage.ctaTitle}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.batteriesPage.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="btn-secondary text-lg px-8 py-4">
              {t.batteries.getQuote}
            </a>
            <a href={`tel:${contact.phoneTel}`} className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
              {t.batteriesPage.callToAction}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
