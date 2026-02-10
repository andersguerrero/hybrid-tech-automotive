'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Upload, Lock, ArrowLeft, Save } from 'lucide-react'
import { batteries as initialBatteries } from '@/data'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

// Get unique battery images with their vehicle groups
function getBatteryImageGroups(batteries: typeof initialBatteries) {
  const imageGroups = new Map<string, { image: string; vehicles: string[]; count: number }>()
  
  batteries.forEach(battery => {
    if (!imageGroups.has(battery.image)) {
      imageGroups.set(battery.image, {
        image: battery.image,
        vehicles: [],
        count: 0
      })
    }
    
    const group = imageGroups.get(battery.image)!
    if (!group.vehicles.includes(battery.vehicle)) {
      group.vehicles.push(battery.vehicle)
    }
    group.count++
  })
  
  return Array.from(imageGroups.values())
}

export default function BatteryImagesAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [batteries, setBatteries] = useState<typeof initialBatteries>(initialBatteries)
  const [uploading, setUploading] = useState<string | null>(null)
  const [imagesChanged, setImagesChanged] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }

    // Load batteries from localStorage if available
    try {
      const stored = localStorage.getItem('admin_batteries')
      if (stored) {
        const parsed = JSON.parse(stored)
        setBatteries(parsed)
      }
    } catch (e) {
      console.error('Error loading batteries from localStorage', e)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
    } else {
      alert('Invalid password')
    }
  }

  const handleFileUpload = async (file: File, imagePath: string) => {
    setUploading(imagePath)
    
    try {
      // Generate unique filename
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `battery-${timestamp}.${extension}`
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', 'batteries')
      formData.append('fileName', filename)
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const data = await response.json()
      const newImagePath = data.url || `/images/batteries/${filename}`
      
      // Update all batteries using this image
      const updatedBatteries = batteries.map(battery => {
        if (battery.image === imagePath) {
          return { ...battery, image: newImagePath }
        }
        return battery
      })
      
      setBatteries(updatedBatteries)
      setImagesChanged(true)
      
      // Save to localStorage
      localStorage.setItem('admin_batteries', JSON.stringify(updatedBatteries))
      localStorage.setItem('batteries_edited_by_admin', 'true')
      
      // Guardar también en el servidor para que /batteries muestre los cambios
      try {
        await fetch('/api/batteries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batteries: updatedBatteries }),
        })
      } catch (e) {
        console.error('Error saving batteries to server:', e)
      }
      
      // Dispatch event
      window.dispatchEvent(new Event('batteriesUpdated'))
      
      alert('Image updated successfully!')
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(null)
    }
  }

  const handleSaveAll = async () => {
    localStorage.setItem('admin_batteries', JSON.stringify(batteries))
    localStorage.setItem('batteries_edited_by_admin', 'true')
    try {
      await fetch('/api/batteries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batteries }),
      })
    } catch (e) {
      console.error('Error saving batteries to server:', e)
    }
    window.dispatchEvent(new Event('batteriesUpdated'))
    setImagesChanged(false)
    alert('All changes saved successfully!')
  }

  const imageGroups = getBatteryImageGroups(batteries)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Login
            </button>
          </form>
          <Link
            href="/admin"
            className="block text-center mt-4 text-sm text-gray-600 hover:text-primary-500"
          >
            <ArrowLeft className="inline w-4 h-4 mr-1" />
            Back to Admin Panel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Battery Images Management</h1>
            <p className="text-gray-600 mt-2">
              Manage {imageGroups.length} unique battery images used across {batteries.length} battery listings
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAll}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                imagesChanged
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Save className="w-5 h-5" />
              Save All Changes
            </button>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Panel
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <div className="relative h-48 w-full rounded-lg overflow-hidden mb-3">
                  <Image
                    src={group.image}
                    alt={`Battery group ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Used by <span className="font-semibold">{group.count}</span> battery listing(s)
                </p>
                <p className="text-xs text-gray-500">
                  {group.vehicles.length} unique vehicle model(s)
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-1">Vehicle Models:</p>
                  {group.vehicles.slice(0, 3).map((vehicle, idx) => (
                    <p key={idx} className="text-xs text-gray-600">• {vehicle}</p>
                  ))}
                  {group.vehicles.length > 3 && (
                    <p className="text-xs text-gray-500">+ {group.vehicles.length - 3} more...</p>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, group.image)
                  }}
                  className="hidden"
                  id={`upload-${index}`}
                />
                <label
                  htmlFor={`upload-${index}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed border-primary-300 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors text-primary-600 font-medium"
                >
                  <Upload className="w-4 h-4" />
                  {uploading === group.image ? 'Uploading...' : 'Replace Image'}
                </label>
                <p className="text-xs text-center text-gray-500">
                  Recommended: 800x600px, max 2MB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

