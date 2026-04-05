'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, X, ShoppingCart, Check, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAddToCart } from '@/hooks/useAddToCart'
import { BLUR_DATA_URL } from '@/lib/imageUtils'
import type { Battery } from '@/types'

function CompareSlot({ battery, onRemove, onAddToCart, addedToCart }: {
  battery: Battery
  onRemove: () => void
  onAddToCart: () => void
  addedToCart: boolean
}) {
  return (
    <div className="card relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full z-10"
        aria-label="Remove from comparison"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
        <Image
          src={battery.image}
          alt={battery.vehicle}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 min-h-[3rem]">
        {battery.vehicle}
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Price</span>
          <span className="text-2xl font-bold text-primary-500">${battery.price}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Condition</span>
          <span className="font-medium capitalize">{battery.condition}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Warranty</span>
          <span className="font-medium flex items-center">
            <Shield className="w-3 h-3 mr-1 text-green-500" />
            {battery.warranty}
          </span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Type</span>
          <span className="font-medium flex items-center">
            <Zap className="w-3 h-3 mr-1 text-yellow-500" />
            {battery.batteryType}
          </span>
        </div>
        <div className="pt-2">
          <span className="text-gray-500 block mb-1">Description</span>
          <p className="text-gray-700 dark:text-gray-300 text-xs">{battery.description}</p>
        </div>
      </div>

      <button
        onClick={onAddToCart}
        className={`w-full mt-4 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
          addedToCart ? 'bg-green-500 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {addedToCart ? <><Check className="w-4 h-4 mr-2" />Added</> : <><ShoppingCart className="w-4 h-4 mr-2" />Add to Cart</>}
      </button>
    </div>
  )
}

function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center min-h-[400px] hover:border-primary-500 transition-colors"
    >
      <Plus className="w-12 h-12 text-gray-400 mb-2" />
      <span className="text-gray-500">Add battery</span>
    </button>
  )
}

export default function BatteryComparePage() {
  const searchParams = useSearchParams()
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [allBatteries, setAllBatteries] = useState<Battery[]>([])
  const [search, setSearch] = useState('')
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
      setSelectedIds(ids.split(','))
    }
  }, [searchParams])

  // Update selected batteries when IDs or allBatteries change
  useEffect(() => {
    if (allBatteries.length > 0 && selectedIds.length > 0) {
      const found = selectedIds
        .map(id => allBatteries.find(b => b.id === id))
        .filter((b): b is Battery => b !== undefined)
      setBatteries(found)
    }
  }, [selectedIds, allBatteries])

  const addBattery = (battery: Battery) => {
    if (selectedIds.length >= 3) return
    if (selectedIds.includes(battery.id)) return
    setSelectedIds(prev => [...prev, battery.id])
    setShowPicker(false)
    setSearch('')
  }

  const removeBattery = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id))
    setBatteries(prev => prev.filter(b => b.id !== id))
  }

  const filteredBatteries = allBatteries.filter(b =>
    !selectedIds.includes(b.id) &&
    (search === '' || b.vehicle.toLowerCase().includes(search.toLowerCase()) || b.batteryType.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/batteries" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batteries
          </Link>
          <h1 className="text-4xl font-bold mb-2">Compare Batteries</h1>
          <p className="text-blue-100">Select up to 3 batteries to compare side by side</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {batteries.map(battery => (
              <CompareSlot
                key={battery.id}
                battery={battery}
                onRemove={() => removeBattery(battery.id)}
                onAddToCart={() => handleAddToCart(new MouseEvent('click') as unknown as React.MouseEvent, {
                  id: `battery-${battery.id}`,
                  name: battery.vehicle,
                  price: battery.price,
                  type: 'battery',
                  image: battery.image,
                  description: battery.description,
                })}
                addedToCart={addedToCart}
              />
            ))}

            {batteries.length < 3 && (
              <EmptySlot onClick={() => setShowPicker(true)} />
            )}
          </div>

          {/* Battery Picker Modal */}
          {showPicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Select a Battery</h3>
                  <button onClick={() => setShowPicker(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search batteries..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-96 px-4 pb-4">
                  {filteredBatteries.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No batteries found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredBatteries.map(battery => (
                        <button
                          key={battery.id}
                          onClick={() => addBattery(battery)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                            <Image src={battery.image} alt={battery.vehicle} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{battery.vehicle}</p>
                            <p className="text-sm text-gray-500">{battery.batteryType} - {battery.condition}</p>
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
