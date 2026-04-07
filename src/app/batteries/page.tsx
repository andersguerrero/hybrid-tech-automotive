'use client'

import { useState, useEffect, useCallback } from 'react'
import BatteryCard from '@/components/BatteryCard'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { BatterySkeleton, SkeletonGrid } from '@/components/Skeletons'
import { useLanguage } from '@/contexts/LanguageContext'
import { Battery } from '@/types'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, Loader2, GitCompareArrows, X, Filter } from 'lucide-react'
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
  yearRange: { min: number; max: number }
}

export default function BatteriesPage() {
  const { t, locale } = useLanguage()
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

  // Price range filter
  const [minPriceInput, setMinPriceInput] = useState<string>('')
  const [maxPriceInput, setMaxPriceInput] = useState<string>('')
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<string>('')
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<string>('')

  // Year range filter
  const [minYearInput, setMinYearInput] = useState<string>('')
  const [maxYearInput, setMaxYearInput] = useState<string>('')
  const [debouncedMinYear, setDebouncedMinYear] = useState<string>('')
  const [debouncedMaxYear, setDebouncedMaxYear] = useState<string>('')

  // Mobile filter panel
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Debounce price range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPriceInput)
      setDebouncedMaxPrice(maxPriceInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [minPriceInput, maxPriceInput])

  // Debounce year range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinYear(minYearInput)
      setDebouncedMaxYear(maxYearInput)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [minYearInput, maxYearInput])

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
      if (debouncedMinPrice) params.set('minPrice', debouncedMinPrice)
      if (debouncedMaxPrice) params.set('maxPrice', debouncedMaxPrice)
      if (debouncedMinYear) params.set('minYear', debouncedMinYear)
      if (debouncedMaxYear) params.set('maxYear', debouncedMaxYear)

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
  }, [currentPage, debouncedSearch, selectedBrand, selectedModel, selectedCondition, sortBy, sortOrder, debouncedMinPrice, debouncedMaxPrice, debouncedMinYear, debouncedMaxYear])

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

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedCondition('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setMinYearInput('')
    setMaxYearInput('')
    setSortBy('vehicle')
    setSortOrder('asc')
    setCurrentPage(1)
  }

  // Determine active filters for chips
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = []

  if (debouncedSearch) {
    activeFilters.push({
      key: 'search',
      label: `"${debouncedSearch}"`,
      onRemove: () => setSearchTerm('')
    })
  }
  if (selectedBrand) {
    activeFilters.push({
      key: 'brand',
      label: `${t.batteries.brand}: ${selectedBrand}`,
      onRemove: () => { setSelectedBrand(''); setSelectedModel('') }
    })
  }
  if (selectedModel) {
    activeFilters.push({
      key: 'model',
      label: `${t.batteries.model}: ${selectedModel}`,
      onRemove: () => setSelectedModel('')
    })
  }
  if (selectedCondition) {
    const condLabel = selectedCondition === 'new' ? t.batteries.newBattery : t.batteries.refurbishedBattery
    activeFilters.push({
      key: 'condition',
      label: `${t.batteries.condition}: ${condLabel}`,
      onRemove: () => setSelectedCondition('')
    })
  }
  if (debouncedMinPrice || debouncedMaxPrice) {
    const priceLabel = debouncedMinPrice && debouncedMaxPrice
      ? `$${debouncedMinPrice} - $${debouncedMaxPrice}`
      : debouncedMinPrice
        ? `>= $${debouncedMinPrice}`
        : `<= $${debouncedMaxPrice}`
    activeFilters.push({
      key: 'price',
      label: `${t.batteries.priceRange}: ${priceLabel}`,
      onRemove: () => { setMinPriceInput(''); setMaxPriceInput('') }
    })
  }
  if (debouncedMinYear || debouncedMaxYear) {
    const yearLabel = debouncedMinYear && debouncedMaxYear
      ? `${debouncedMinYear} - ${debouncedMaxYear}`
      : debouncedMinYear
        ? `>= ${debouncedMinYear}`
        : `<= ${debouncedMaxYear}`
    activeFilters.push({
      key: 'year',
      label: `${t.batteries.yearRange}: ${yearLabel}`,
      onRemove: () => { setMinYearInput(''); setMaxYearInput('') }
    })
  }

  const hasActiveFilters = activeFilters.length > 0

  // Filter panel content (shared between desktop and mobile)
  const filterContent = (
    <div className="space-y-4">
      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t.batteries.filterBrand}
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">{t.batteries.allBrands}</option>
          {facets?.brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Model Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t.batteries.filterModel}
        </label>
        <select
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">{t.batteries.allModels}</option>
          {facets?.models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>

      {/* Condition Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t.batteries.filterCondition}
        </label>
        <select
          value={selectedCondition}
          onChange={(e) => handleConditionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="">{t.batteries.allConditions}</option>
          <option value="new">{t.batteries.newBattery}</option>
          <option value="refurbished">{t.batteries.refurbishedBattery}</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t.batteries.priceRange}
          {facets?.priceRange && (
            <span className="text-xs text-gray-400 ml-1">
              (${facets.priceRange.min} - ${facets.priceRange.max})
            </span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder={t.batteries.minPrice}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              min={0}
              className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <span className="text-gray-400 text-sm">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              placeholder={t.batteries.maxPrice}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              min={0}
              className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Year Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t.batteries.yearRange}
          {facets?.yearRange && (
            <span className="text-xs text-gray-400 ml-1">
              ({facets.yearRange.min} - {facets.yearRange.max})
            </span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder={t.batteries.minYear}
            value={minYearInput}
            onChange={(e) => setMinYearInput(e.target.value)}
            min={1990}
            max={2030}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <span className="text-gray-400 text-sm">-</span>
          <input
            type="number"
            placeholder={t.batteries.maxYear}
            value={maxYearInput}
            onChange={(e) => setMaxYearInput(e.target.value)}
            min={1990}
            max={2030}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <SlidersHorizontal className="inline w-4 h-4 mr-1" />
          {t.batteries.sortBy}
        </label>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
        >
          <option value="vehicle-asc">{t.batteries.sortVehicleAZ}</option>
          <option value="vehicle-desc">{t.batteries.sortVehicleZA}</option>
          <option value="price-asc">{t.batteries.sortPriceLowHigh}</option>
          <option value="price-desc">{t.batteries.sortPriceHighLow}</option>
          <option value="year-desc">{t.batteries.sortYearNewest}</option>
          <option value="year-asc">{t.batteries.sortYearOldest}</option>
        </select>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          {t.batteries.clearAllFilters}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <FadeIn className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.batteriesPage.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.batteriesPage.heroDescription}
          </p>
        </FadeIn>
      </section>

      {/* Search Bar + Mobile Filter Toggle */}
      <section className="py-6 bg-white border-b">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.batteries.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">{t.batteries.filters}</span>
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filter Chips + Results Count */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* Results count */}
              <div className="text-sm text-gray-600 mr-2">
                {pagination ? (
                  pagination.total === 0
                    ? t.batteries.noResults
                    : `${t.batteries.showingResults} ${batteries.length} ${t.batteries.of} ${pagination.total} ${t.batteries.batteriesLabel}`
                ) : ''}
              </div>

              {/* Compare Link */}
              <Link
                href="/batteries/compare"
                className="ml-auto inline-flex items-center text-primary-500 hover:text-primary-600 font-medium text-sm"
              >
                <GitCompareArrows className="w-4 h-4 mr-1" />
                {t.batteries.compareBatteries}
              </Link>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t.batteries.activeFilters}:
                </span>
                {activeFilters.map(filter => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200"
                  >
                    {filter.label}
                    <button
                      onClick={filter.onRemove}
                      className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  {t.batteries.clearAllFilters}
                </button>
              </div>
            )}

            {/* Pagination info */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-2 text-sm text-gray-500 text-right">
                {locale === 'es' ? 'Pagina' : 'Page'} {pagination.page} {t.batteries.of} {pagination.totalPages}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Grid */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  {t.batteries.filters}
                </h3>
                {filterContent}
              </div>
            </aside>

            {/* Battery Grid */}
            <div className="flex-1 min-w-0">
              {/* Loading State */}
              {loading && (
                <SkeletonGrid count={6} skeleton={BatterySkeleton} />
              )}

              {/* Batteries Grid */}
              {!loading && batteries.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {batteries.map((battery) => (
                    <BatteryCard key={battery.id} battery={battery} previousPrice={previousPrices[battery.id]} />
                  ))}
                </div>
              )}

              {/* No Results */}
              {!loading && batteries.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500">{t.batteries.noResults}</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 btn-primary"
                  >
                    {t.batteries.clearAllFilters}
                  </button>
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
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
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Slide-Out Panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  {t.batteries.filters}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={t.batteries.closeFilters}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full mt-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                {pagination ? `${t.batteries.showingResults} ${pagination.total} ${t.batteries.batteriesLabel}` : t.batteries.closeFilters}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warranty Info */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t.batteriesPage.warrantyTitle}
              </h2>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StaggerItem className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-500">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty1Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty1Desc}</p>
              </StaggerItem>
              <StaggerItem className="space-y-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-secondary-500">&#10003;</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty2Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty2Desc}</p>
              </StaggerItem>
              <StaggerItem className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-500">24/7</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty3Title}</h3>
                <p className="text-gray-600">{t.batteriesPage.warranty3Desc}</p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-primary-500 text-white">
        <FadeIn className="container-custom text-center">
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
        </FadeIn>
      </section>
    </div>
  )
}
