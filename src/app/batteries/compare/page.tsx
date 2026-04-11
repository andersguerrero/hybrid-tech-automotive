'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, X, ShoppingCart, Check, Shield, Zap, Link2, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAddToCart } from '@/hooks/useAddToCart'
import { BLUR_DATA_URL } from '@/lib/imageUtils'
import type { Battery } from '@/types'

const MAX_COMPARE = 4

export default function BatteryComparePage() {
  const searchParams = useSearchParams()
  const { t, locale } = useLanguage()
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [allBatteries, setAllBatteries] = useState<Battery[]>([])
  const [search, setSearch] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [highlightDiffs, setHighlightDiffs] = useState(true)
  const { addedToCart, handleAddToCart } = useAddToCart()

  const loadBatteries = useCallback(async () => {
    const res = await fetch('/api/batteries?limit=200')
    const data = await res.json()
    setAllBatteries(data.batteries || [])
  }, [])

  useEffect(() => {
    loadBatteries()
  }, [loadBatteries])

  // Load from URL params
  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      setSelectedIds(ids.split(',').filter(Boolean).slice(0, MAX_COMPARE))
    }
  }, [searchParams])

  // Update selected batteries when IDs or allBatteries change
  useEffect(() => {
    if (allBatteries.length > 0 && selectedIds.length > 0) {
      const found = selectedIds
        .map(id => allBatteries.find(b => b.id === id))
        .filter((b): b is Battery => b !== undefined)
      setBatteries(found)
    } else if (selectedIds.length === 0) {
      setBatteries([])
    }
  }, [selectedIds, allBatteries])

  // Update URL when IDs change
  useEffect(() => {
    if (selectedIds.length > 0) {
      const url = new URL(window.location.href)
      url.searchParams.set('ids', selectedIds.join(','))
      window.history.replaceState({}, '', url.toString())
    }
  }, [selectedIds])

  const addBattery = (battery: Battery) => {
    if (selectedIds.length >= MAX_COMPARE) return
    if (selectedIds.includes(battery.id)) return
    setSelectedIds(prev => [...prev, battery.id])
    setShowPicker(false)
    setSearch('')
  }

  const removeBattery = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id))
    setBatteries(prev => prev.filter(b => b.id !== id))
  }

  const shareComparison = async () => {
    const url = `${window.location.origin}/batteries/compare?ids=${selectedIds.join(',')}`
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    }
  }

  const filteredBatteries = allBatteries.filter(b =>
    !selectedIds.includes(b.id) &&
    (search === '' || b.vehicle.toLowerCase().includes(search.toLowerCase()) || b.batteryType.toLowerCase().includes(search.toLowerCase()))
  )

  // Find the cheapest battery for highlighting
  const cheapestPrice = batteries.length > 0 ? Math.min(...batteries.map(b => b.price)) : 0

  // Check if values differ across batteries for a given field
  const valuesAreDifferent = (getter: (b: Battery) => string | number): boolean => {
    if (batteries.length < 2) return false
    const values = batteries.map(getter)
    return !values.every(v => v === values[0])
  }

  const diffClass = (getter: (b: Battery) => string | number): string => {
    if (!highlightDiffs) return ''
    return valuesAreDifferent(getter) ? 'bg-yellow-50' : ''
  }

  // Parse year from vehicle name
  const getYear = (vehicle: string): string => {
    const m = vehicle.match(/\((\d{4})\)/)
    return m ? m[1] : '-'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/batteries" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.compare.backToBatteries}
          </Link>
          <h1 className="text-4xl font-bold mb-2">{t.compare.title}</h1>
          <p className="text-blue-100">{t.compare.subtitle}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          {/* Toolbar */}
          {batteries.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {batteries.length < MAX_COMPARE && (
                <button
                  onClick={() => setShowPicker(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t.compare.addBattery}
                </button>
              )}

              <button
                onClick={shareComparison}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    {t.compare.linkCopied}
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {t.compare.shareComparison}
                  </>
                )}
              </button>

              <label className="inline-flex items-center gap-2 text-sm text-gray-600 ml-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightDiffs}
                  onChange={(e) => setHighlightDiffs(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                {t.compare.highlightDifferences}
              </label>
            </div>
          )}

          {/* Empty state */}
          {batteries.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">{t.compare.noBatteriesToCompare}</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">{t.compare.addBatteriesToStart}</p>
              <button
                onClick={() => setShowPicker(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                {t.compare.addBattery}
              </button>
            </div>
          )}

          {/* Comparison Table - Desktop */}
          {batteries.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-40 p-3 text-left text-sm font-semibold text-gray-500 border-b-2 border-gray-200 bg-white sticky left-0 z-10"></th>
                    {batteries.map(battery => (
                      <th key={battery.id} className="p-3 border-b-2 border-gray-200 min-w-[220px]">
                        <div className="relative">
                          <button
                            onClick={() => removeBattery(battery.id)}
                            className="absolute -top-1 -right-1 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full z-10 transition-colors"
                            aria-label={t.compare.removeBattery}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    {batteries.length < MAX_COMPARE && (
                      <th className="p-3 border-b-2 border-gray-200 min-w-[220px]">
                        <button
                          onClick={() => setShowPicker(true)}
                          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          {t.compare.addBattery}
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Image Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.image}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className="p-3 border-b border-gray-100">
                        <div className="relative h-36 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                          <Image
                            src={battery.image || '/logo.png'}
                            alt={battery.vehicle}
                            width={160}
                            height={96}
                            className="object-contain p-3"
                          />
                        </div>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Vehicle Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.vehicle}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => b.vehicle)}`}>
                        <span className="font-semibold text-gray-900">{battery.vehicle}</span>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Price Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.price}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => b.price)}`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${battery.price === cheapestPrice && batteries.length > 1 ? 'text-green-600' : 'text-primary-500'}`}>
                            ${battery.price}
                          </span>
                          {battery.price === cheapestPrice && batteries.length > 1 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              {t.compare.cheapest}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Year Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {locale === 'es' ? 'Ano' : 'Year'}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => getYear(b.vehicle))}`}>
                        <span className="font-medium text-gray-900">{getYear(battery.vehicle)}</span>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Condition Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.conditionLabel}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => b.condition)}`}>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          battery.condition === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {battery.condition === 'new' ? t.compare.new : t.compare.refurbished}
                        </span>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Warranty Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.warranty}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => b.warranty)}`}>
                        <span className="font-medium flex items-center text-gray-900">
                          <Shield className="w-4 h-4 mr-1.5 text-green-500" />
                          {battery.warranty}
                        </span>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Battery Type Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.batteryType}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className={`p-3 border-b border-gray-100 ${diffClass(b => b.batteryType)}`}>
                        <span className="font-medium flex items-center text-gray-900">
                          <Zap className="w-4 h-4 mr-1.5 text-yellow-500" />
                          {battery.batteryType}
                        </span>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Description Row */}
                  <tr>
                    <td className="p-3 text-sm font-medium text-gray-500 border-b border-gray-100 bg-white sticky left-0 z-10">
                      {t.compare.description}
                    </td>
                    {batteries.map(battery => (
                      <td key={battery.id} className="p-3 border-b border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed">{battery.description}</p>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td className="border-b border-gray-100"></td>}
                  </tr>

                  {/* Add to Cart Row */}
                  <tr>
                    <td className="p-3 bg-white sticky left-0 z-10"></td>
                    {batteries.map(battery => (
                      <td key={battery.id} className="p-3">
                        <button
                          onClick={(e) => handleAddToCart(e, {
                            id: `battery-${battery.id}`,
                            name: battery.vehicle,
                            price: battery.price,
                            type: 'battery',
                            image: '/logo.png',
                            description: battery.description,
                          })}
                          className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            addedToCart ? 'bg-green-500 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
                          }`}
                        >
                          {addedToCart ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              {t.compare.addedToCart}
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              {t.compare.addToCart}
                            </>
                          )}
                        </button>
                      </td>
                    ))}
                    {batteries.length < MAX_COMPARE && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Comparison Cards - Mobile */}
          {batteries.length > 0 && (
            <div className="md:hidden space-y-6">
              {batteries.map(battery => (
                <div key={battery.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                  <div className="relative">
                    <button
                      onClick={() => removeBattery(battery.id)}
                      className="absolute top-3 right-3 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full z-10 transition-colors"
                      aria-label={t.compare.removeBattery}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative h-44 bg-gray-100 flex items-center justify-center">
                      <Image
                        src={battery.image || '/logo.png'}
                        alt={battery.vehicle}
                        width={160}
                        height={96}
                        className="object-contain p-3"
                      />
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900">{battery.vehicle}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${battery.price === cheapestPrice && batteries.length > 1 ? 'text-green-600' : 'text-primary-500'}`}>
                        ${battery.price}
                      </span>
                      {battery.price === cheapestPrice && batteries.length > 1 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {t.compare.cheapest}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-gray-500 block text-xs mb-0.5">{t.compare.conditionLabel}</span>
                        <span className={`font-medium ${battery.condition === 'new' ? 'text-blue-700' : 'text-amber-700'}`}>
                          {battery.condition === 'new' ? t.compare.new : t.compare.refurbished}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-gray-500 block text-xs mb-0.5">{t.compare.warranty}</span>
                        <span className="font-medium text-gray-900 flex items-center">
                          <Shield className="w-3.5 h-3.5 mr-1 text-green-500" />
                          {battery.warranty}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-gray-500 block text-xs mb-0.5">{t.compare.batteryType}</span>
                        <span className="font-medium text-gray-900 flex items-center">
                          <Zap className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                          {battery.batteryType}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <span className="text-gray-500 block text-xs mb-0.5">{locale === 'es' ? 'Ano' : 'Year'}</span>
                        <span className="font-medium text-gray-900">{getYear(battery.vehicle)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{battery.description}</p>
                    <button
                      onClick={(e) => handleAddToCart(e, {
                        id: `battery-${battery.id}`,
                        name: battery.vehicle,
                        price: battery.price,
                        type: 'battery',
                        image: '/logo.png',
                        description: battery.description,
                      })}
                      className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        addedToCart ? 'bg-green-500 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t.compare.addedToCart}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {t.compare.addToCart}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}

              {/* Mobile Add Button */}
              {batteries.length < MAX_COMPARE && (
                <button
                  onClick={() => setShowPicker(true)}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex flex-col items-center justify-center"
                >
                  <Plus className="w-10 h-10 mb-2" />
                  <span className="font-medium">{t.compare.addBattery}</span>
                </button>
              )}
            </div>
          )}

          {/* Battery Picker Modal */}
          {showPicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-bold">{t.compare.selectBattery}</h3>
                  <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={t.compare.searchBatteries}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-96 px-4 pb-4">
                  {filteredBatteries.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t.compare.noBatteriesFound}</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredBatteries.map(battery => (
                        <button
                          key={battery.id}
                          onClick={() => addBattery(battery)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                            <Image src={battery.image || '/logo.png'} alt={battery.vehicle} width={40} height={40} className="object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{battery.vehicle}</p>
                            <p className="text-sm text-gray-500">{battery.batteryType} - {battery.condition === 'new' ? t.compare.new : t.compare.refurbished}</p>
                          </div>
                          <span className="text-lg font-bold text-primary-500">${battery.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
