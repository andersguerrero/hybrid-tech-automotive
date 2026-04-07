'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Search, X } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { BlogSkeleton, SkeletonGrid } from '@/components/Skeletons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBlogPosts } from '@/hooks/useData'

// Map of category keys to translation keys
const categoryTranslationMap: Record<string, string> = {
  'Battery Maintenance': 'categoryBatteryMaintenance',
  'Fuel Economy': 'categoryFuelEconomy',
  'Maintenance': 'categoryMaintenance',
  'Vehicle Comparison': 'categoryVehicleComparison',
  'Driving Tips': 'categoryDrivingTips',
  'Technology': 'categoryTechnology',
}

export default function BlogPage() {
  const { t } = useLanguage()
  const { blogPosts, isReady } = useBlogPosts()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [subscribeEmail, setSubscribeEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscribeEmail || !subscribeEmail.includes('@')) return
    setSubscribeStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      })
      if (res.ok) {
        setSubscribeStatus('success')
        setSubscribeEmail('')
      } else {
        setSubscribeStatus('error')
      }
    } catch {
      setSubscribeStatus('error')
    }
  }

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const cats = Array.from(new Set(blogPosts.map((p: { category: string }) => p.category))) as string[]
    return cats
  }, [blogPosts])

  // Translate category name
  const translateCategory = (category: string) => {
    const key = categoryTranslationMap[category]
    if (key && (t.blog as Record<string, string>)[key]) {
      return (t.blog as Record<string, string>)[key]
    }
    return category
  }

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || post.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [blogPosts, searchQuery, selectedCategory])

  // Si no hay posts, mostrar skeletons de carga
  if (!isReady || blogPosts.length === 0) {
    return (
      <div className="min-h-screen">
        <section className="bg-gray-50 section-padding">
          <div className="container-custom text-center">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6 animate-pulse" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse" />
          </div>
        </section>
        <section className="section-padding">
          <div className="container-custom">
            <SkeletonGrid count={3} skeleton={BlogSkeleton} />
          </div>
        </section>
      </div>
    )
  }

  const featuredPost = selectedCategory === 'all' && searchQuery === '' ? blogPosts[0] : null
  const gridPosts = featuredPost ? filteredPosts.filter(p => p.id !== featuredPost.id) : filteredPosts

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <FadeIn className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.blog.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.blog.heroDescription}
          </p>
        </FadeIn>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container-custom">
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.blog.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.blog.allCategories}
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {translateCategory(category)}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              {t.blog.showingResults} {filteredPosts.length} {t.blog.ofResults} {blogPosts.length} {t.blog.articles}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post (only when no search/filter is active) */}
      {featuredPost && (
        <section className="section-padding bg-white">
          <FadeIn className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 rounded-xl overflow-hidden">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    {translateCategory(featuredPost.category)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900">
                  {featuredPost.title}
                </h2>

                <p className="text-lg text-gray-600">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="btn-primary inline-flex items-center"
                  >
                    {t.blog.readMore}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      )}

      {/* Blog Posts Grid / No Results */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          {!featuredPost && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t.blog.latestArticlesTitle}
              </h2>
              <p className="text-lg text-gray-600">
                {t.blog.latestArticlesDesc}
              </p>
            </div>
          )}

          {featuredPost && (
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t.blog.latestArticlesTitle}
              </h2>
              <p className="text-lg text-gray-600">
                {t.blog.latestArticlesDesc}
              </p>
            </div>
          )}

          {gridPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {t.blog.noResultsTitle}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t.blog.noResultsDesc}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-6 btn-primary"
              >
                {t.blog.allCategories}
              </button>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <article className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                          {translateCategory(post.category)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="text-sm">{post.author}</span>
                        </div>

                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-primary-500 hover:text-primary-600 font-medium text-sm flex items-center"
                        >
                          {t.blog.readMore}
                          <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-primary-500 text-white">
        <FadeIn className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.blog.stayUpdated}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t.blog.newsletterDesc}
          </p>
          {subscribeStatus === 'success' ? (
            <p className="text-lg font-semibold text-white">
              {t.blog.thankYouSubscribe || 'Thank you for subscribing!'}
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder={t.blog.enterEmail}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="btn-secondary px-6 py-3 disabled:opacity-50"
              >
                {subscribeStatus === 'loading' ? '...' : t.blog.subscribe}
              </button>
            </form>
          )}
          {subscribeStatus === 'error' && (
            <p className="mt-4 text-sm text-red-200">
              {t.blog.subscribeError || 'Something went wrong. Please try again.'}
            </p>
          )}
        </FadeIn>
      </section>
    </div>
  )
}
