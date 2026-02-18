'use client'

import { useState, useMemo } from 'react'
import BatteryCard from '@/components/BatteryCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBatteries } from '@/hooks/useData'
import { Battery } from '@/types'
import { Search } from 'lucide-react'

export default function BatteriesPage() {
  const { t } = useLanguage()
  const { batteries, isReady } = useBatteries()
  
  // Filter states
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [selectedCondition, setSelectedCondition] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Extract unique models filtered by selected brand
  const uniqueModels = useMemo(() => {
    const models = new Set<string>()
    batteries.forEach(battery => {
      // If a brand is selected, only include models from that brand
      if (selectedBrand !== 'all' && !battery.vehicle.startsWith(selectedBrand)) {
        return
      }
      const match = battery.vehicle.match(/^(Toyota|Lexus)\s+(.+?)\s*\(/)
      if (match) {
        models.add(match[2])
      }
    })
    return Array.from(models).sort()
  }, [batteries, selectedBrand])
  
  
  // Filter batteries based on selections
  const filteredBatteries = useMemo(() => {
    return batteries.filter(battery => {
      // Brand filter
      if (selectedBrand !== 'all' && !battery.vehicle.startsWith(selectedBrand)) {
        return false
      }
      
      // Model filter
      if (selectedModel !== 'all') {
        const match = battery.vehicle.match(/^(Toyota|Lexus)\s+(.+?)\s*\(/)
        if (!match || match[2] !== selectedModel) {
          return false
        }
      }
      
      // Condition filter
      if (selectedCondition !== 'all' && battery.condition !== selectedCondition) {
        return false
      }
      
      // Search term filter
      if (searchTerm && !battery.vehicle.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      return true
    })
  }, [batteries, selectedBrand, selectedModel, selectedCondition, searchTerm])
  
  // Group filtered batteries by brand
  const toyotaBatteries = filteredBatteries.filter(b => b.vehicle.startsWith('Toyota'))
  const lexusBatteries = filteredBatteries.filter(b => b.vehicle.startsWith('Lexus'))
  
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
      <section className="py-8 bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.batteries.filterBrand}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value
                    setSelectedBrand(newBrand)
                    // Reset model if it doesn't belong to the new brand
                    if (newBrand !== 'all' && selectedModel !== 'all') {
                      const modelBelongsToBrand = batteries.some(battery => {
                        if (!battery.vehicle.startsWith(newBrand)) return false
                        const match = battery.vehicle.match(/^(Toyota|Lexus)\s+(.+?)\s*\(/)
                        return match && match[2] === selectedModel
                      })
                      if (!modelBelongsToBrand) {
                        setSelectedModel('all')
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t.batteries.allBrands}</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Lexus">Lexus</option>
                </select>
              </div>
              
              {/* Model Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.batteries.filterModel}
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t.batteries.allModels}</option>
                  {uniqueModels.map(model => (
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
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">{t.batteries.allConditions}</option>
                  <option value="new">{t.batteries.newBattery}</option>
                  <option value="refurbished">{t.batteries.refurbishedBattery}</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-2 text-sm text-gray-600">
              {filteredBatteries.length === 0 ? (
                <p className="text-center py-8">{t.batteries.noResults}</p>
              ) : (
                <p className="text-center">
                  {filteredBatteries.length} {t.batteries.resultsFound}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Batteries Grid - Toyota */}
      {!isReady && (
        <section className="pt-4 pb-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {isReady && toyotaBatteries.length > 0 && (
        <section className="pt-4 pb-16 bg-white">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Toyota Hybrid Batteries
              </h2>
              <p className="text-gray-600">
                High-quality rebuilt NiMH batteries for Toyota hybrid vehicles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toyotaBatteries.map((battery) => (
                <BatteryCard key={battery.id} battery={battery} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Batteries Grid - Lexus */}
      {isReady && lexusBatteries.length > 0 && (
        <section className="pt-8 pb-16 bg-gray-50">
          <div className="container-custom">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Lexus Hybrid Batteries
              </h2>
              <p className="text-gray-600">
                Premium rebuilt NiMH batteries for Lexus hybrid vehicles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lexusBatteries.map((battery) => (
                <BatteryCard key={battery.id} battery={battery} />
              ))}
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
                <p className="text-gray-600">
                  {t.batteriesPage.warranty1Desc}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-secondary-500">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty2Title}</h3>
                <p className="text-gray-600">
                  {t.batteriesPage.warranty2Desc}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary-500">24/7</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t.batteriesPage.warranty3Title}</h3>
                <p className="text-gray-600">
                  {t.batteriesPage.warranty3Desc}
                </p>
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
            <a href="tel:+18327625299" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500">
              {t.batteriesPage.callToAction}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
