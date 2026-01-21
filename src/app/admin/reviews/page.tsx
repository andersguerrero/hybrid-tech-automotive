'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Lock, Plus, Edit, Trash2, ArrowLeft, Star } from 'lucide-react'
import { reviews as initialReviews } from '@/data'
import type { Review } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ReviewsAdminPage() {
  const { t } = useLanguage()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [reviewsData, setReviewsData] = useState<Review[]>(initialReviews)
  const [savedMessage, setSavedMessage] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Review>>({
    author: '',
    rating: 5,
    comment: '',
    date: new Date().toISOString().split('T')[0],
    verified: true
  })

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Toyotaprius2024!'

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }

    // Cargar reviews guardados desde localStorage
    const savedReviews = localStorage.getItem('admin_reviews')
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews)
        setReviewsData(parsed)
      } catch (error) {
        console.error('Error loading saved reviews:', error)
      }
    }
  }, [])

  // Guardar reviews en localStorage cuando cambien
  useEffect(() => {
    if (reviewsData.length > 0 && isAuthenticated) {
      localStorage.setItem('admin_reviews', JSON.stringify(reviewsData))
      // Disparar evento personalizado para actualizar otros componentes
      window.dispatchEvent(new CustomEvent('reviewsUpdated'))
    }
  }, [reviewsData, isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-custom max-w-md">
          <div className="card">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold">{t.admin.adminAccess}</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder={t.admin.passwordPlaceholder}
                required
              />
              <button type="submit" className="w-full btn-primary">{t.admin.loginButton}</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    if (!formData.author || !formData.comment || !formData.date || !formData.rating) {
      alert(t.admin.fillAllFields)
      return
    }

    if (editingId) {
      const updated = reviewsData.map(r => 
        r.id === editingId ? { ...formData as Review, id: editingId } : r
      )
      setReviewsData(updated)
      localStorage.setItem('admin_reviews', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('reviewsUpdated'))
      setSavedMessage(t.admin.reviewUpdated)
    } else if (isAdding) {
      const newId = (reviewsData.length + 1).toString()
      const updated = [...reviewsData, { ...formData as Review, id: newId }]
      setReviewsData(updated)
      localStorage.setItem('admin_reviews', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('reviewsUpdated'))
      setSavedMessage(t.admin.reviewAdded)
    }

    setFormData({
      author: '',
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0],
      verified: true
    })
    setIsAdding(false)
    setEditingId(null)
    setTimeout(() => setSavedMessage(''), 3000)
  }

  const handleEdit = (review: Review) => {
    setFormData(review)
    setEditingId(review.id)
    setIsAdding(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm(t.admin.confirmDelete)) {
      const updated = reviewsData.filter(r => r.id !== id)
      setReviewsData(updated)
      localStorage.setItem('admin_reviews', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('reviewsUpdated'))
      setSavedMessage(t.admin.reviewDeleted)
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  const handleCancel = () => {
    setFormData({
      author: '',
      rating: 5,
      comment: '',
      date: new Date().toISOString().split('T')[0],
      verified: true
    })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary-500 text-white section-padding">
        <div className="container-custom">
          <Link href="/admin" className="inline-flex items-center text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.admin.backToPanel}
          </Link>
          <h1 className="text-4xl font-bold mb-4">{t.admin.reviewManagement}</h1>
          <p className="text-xl text-blue-100">{t.admin.reviewManagementDesc}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-6xl">
          {savedMessage && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
              {savedMessage}
            </div>
          )}

          {/* Form */}
          {(isAdding || editingId) && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? t.admin.editReview : t.admin.addNewReview}
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.admin.customerName}</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t.admin.customerNamePlaceholder}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.admin.reviewDate}</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.admin.rating}</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: rating })}
                        className={`p-2 rounded-lg transition-colors ${
                          formData.rating === rating
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${formData.rating === rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-gray-600 font-medium">
                      {formData.rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.admin.comment}</label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={6}
                    placeholder={t.admin.commentPlaceholder}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t.admin.commentTip}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified || false}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                    {t.admin.verifiedReview}
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button onClick={handleSave} className="btn-primary flex items-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>{t.common.save}</span>
                  </button>
                  <button onClick={handleCancel} className="btn-outline">
                    {t.common.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isAdding && !editingId && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">{t.admin.howToAdd}</h3>
              <ol className="space-y-2 text-blue-800 text-sm">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>{t.admin.openGoogleProfile}: <a href="https://share.google/4eXqgy02NYsMBAvto" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{t.reviews.viewOnGoogle}</a></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>{t.admin.navigateToReviews}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>{t.admin.copyEachReview}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>{t.admin.clickAddReview}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>{t.admin.reviewsAutoDisplay}</span>
                </li>
              </ol>
            </div>
          )}

          {/* Add Button */}
          {!isAdding && !editingId && (
            <div className="mb-6">
              <button
                onClick={() => setIsAdding(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{t.admin.addGoogleReview}</span>
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">{t.admin.currentReviews} ({reviewsData.length})</h2>
            
            {reviewsData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.admin.noReviewsAdded}</p>
            ) : (
              <div className="space-y-4">
                {reviewsData.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{review.author}</h3>
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {t.reviews.verified}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 italic mt-3">"{review.comment}"</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => handleEdit(review)}
                        className="btn-outline flex items-center space-x-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span>{t.common.edit}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="btn-outline flex items-center space-x-2 text-sm text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{t.common.delete}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

