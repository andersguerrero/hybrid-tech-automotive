'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Save, AlertCircle } from 'lucide-react'
import { services as initialServices } from '@/data/services'
import { batteries as initialBatteries } from '@/data/batteries'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PricesPage() {
  const { t } = useLanguage()
  const [servicesData, setServicesData] = useState<typeof initialServices>([])
  const [batteriesData, setBatteriesData] = useState<typeof initialBatteries>([])
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    // Cargar datos guardados desde localStorage
    const savedServices = localStorage.getItem('admin_services')
    if (savedServices) {
      try {
        setServicesData(JSON.parse(savedServices))
      } catch (e) {
        console.error('Error loading saved services:', e)
        setServicesData(initialServices)
      }
    } else {
      setServicesData(initialServices)
    }

    const savedBatteries = localStorage.getItem('admin_batteries')
    if (savedBatteries) {
      try {
        setBatteriesData(JSON.parse(savedBatteries))
      } catch (e) {
        console.error('Error loading saved batteries:', e)
        setBatteriesData(initialBatteries)
      }
    } else {
      setBatteriesData(initialBatteries)
    }
  }, [])

  const handleServicePriceChange = (id: string, newPrice: number) => {
    setServicesData(prev => 
      prev.map(service => 
        service.id === id ? { ...service, price: newPrice } : service
      )
    )
  }

  const handleBatteryPriceChange = (id: string, newPrice: number) => {
    setBatteriesData(prev => 
      prev.map(battery => 
        battery.id === id ? { ...battery, price: newPrice } : battery
      )
    )
  }

  const handleSave = async () => {
    try {
      // Guardar en localStorage
      localStorage.setItem('admin_services', JSON.stringify(servicesData))
      localStorage.setItem('admin_batteries', JSON.stringify(batteriesData))

      // Disparar eventos para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('servicesUpdated'))
      window.dispatchEvent(new CustomEvent('batteriesUpdated'))

      // También llamar al API para posible uso futuro
      await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          services: servicesData,
          batteries: batteriesData,
        }),
      })

      setSavedMessage(t.admin.pricesSaved)
      setErrorMessage('')
      
      setTimeout(() => {
        setSavedMessage('')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(t.admin.pricesError)
      setSavedMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t.admin.pricesTitle}
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                {t.admin.pricesSubtitle}
              </p>
            </div>
            <div className="hidden md:block">
              <DollarSign className="w-24 h-24 text-blue-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Messages */}
      {savedMessage && (
        <section className="section-padding pt-8">
          <div className="container-custom">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
              {savedMessage}
            </div>
          </div>
        </section>
      )}

      {errorMessage && (
        <section className="section-padding pt-8">
          <div className="container-custom">
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errorMessage}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t.admin.servicesSection}
                </h2>
                <p className="text-gray-600">
                  {t.admin.servicesPriceDesc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{t.admin.saveChanges}</span>
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {servicesData.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => 
                          handleServicePriceChange(service.id, Number(e.target.value))
                        }
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                        min="0"
                        step="1"
                      />
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {service.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Batteries Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="card">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t.admin.batteriesSection}
                </h2>
                <p className="text-gray-600">
                  {t.admin.batteriesPriceDesc}
                </p>
              </div>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{t.admin.saveChanges}</span>
              </button>
            </div>

            <div className="space-y-6">
              {batteriesData.map((battery) => (
                <div
                  key={battery.id}
                  className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {battery.vehicle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {battery.batteryType} • {battery.warranty}
                    </p>
                    <p className="text-sm text-gray-500">
                      {battery.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <input
                        type="number"
                        value={battery.price}
                        onChange={(e) => 
                          handleBatteryPriceChange(battery.id, Number(e.target.value))
                        }
                        className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg font-semibold"
                        min="0"
                        step="1"
                      />
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800">
                      {battery.warranty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-blue-800">
                <p className="font-semibold mb-1">{t.admin.noteTitle}</p>
                <p className="text-sm">
                  {t.admin.noteText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

