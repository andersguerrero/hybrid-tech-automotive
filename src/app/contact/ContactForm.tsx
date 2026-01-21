'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ContactForm() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(result.message || t.contact.successMessageContact)
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        setErrorMessage(result.error || t.contact.errorMessageContact)
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(t.contact.generalErrorContact)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.contact.sendMessage}
      </h2>
      {successMessage && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t.contact.fullName}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t.contact.fullNamePlaceholder}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t.contact.emailAddress}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t.contact.emailPlaceholder}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t.contact.phoneNumber}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t.contact.phonePlaceholder}
          />
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            {t.contact.subjectLabel}
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t.contact.subjectPlaceholder}</option>
            <option value="hybrid-battery">{t.contact.subjectHybridBattery}</option>
            <option value="general-service">{t.contact.subjectGeneralService}</option>
            <option value="diagnostic">{t.contact.subjectDiagnostic}</option>
            <option value="quote">{t.contact.subjectQuote}</option>
            <option value="other">{t.contact.subjectOther}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {t.contact.messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t.contact.messagePlaceholder}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            t.contact.sending
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              {t.contact.sendMessageButton}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
