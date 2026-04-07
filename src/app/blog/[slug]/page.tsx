'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowLeft, ArrowRight, Clock, List } from 'lucide-react'
import { useBlogPosts } from '@/hooks/useData'
import { useLanguage } from '@/contexts/LanguageContext'
import ShareButtons from '@/components/ShareButtons'
import type { BlogPost } from '@/types'

// Map of category keys to translation keys
const categoryTranslationMap: Record<string, string> = {
  'Battery Maintenance': 'categoryBatteryMaintenance',
  'Fuel Economy': 'categoryFuelEconomy',
  'Maintenance': 'categoryMaintenance',
  'Vehicle Comparison': 'categoryVehicleComparison',
  'Driving Tips': 'categoryDrivingTips',
  'Technology': 'categoryTechnology',
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function extractHeadings(content: string): { text: string; id: string }[] {
  const headings: { text: string; id: string }[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/^\*\*(.+?)\*\*$/)
    if (match) {
      const text = match[1]
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ text, id })
    }
  }
  return headings
}

function renderContentWithIds(content: string): React.ReactNode[] {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = line.match(/^\*\*(.+?)\*\*$/)

    if (headingMatch) {
      const text = headingMatch[1]
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
      elements.push(
        <h2
          key={i}
          id={id}
          className="text-2xl font-bold text-gray-900 mt-8 mb-4 scroll-mt-24"
        >
          {text}
        </h2>
      )
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-6 list-disc text-gray-700 leading-relaxed">
          {line.slice(2)}
        </li>
      )
    } else if (line.trim() === '') {
      elements.push(<br key={i} />)
    } else {
      // Inline bold
      const parts = line.split(/\*\*(.+?)\*\*/g)
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j}>{part}</strong>
        ) : (
          <span key={j}>{part}</span>
        )
      )
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed mb-2">
          {rendered}
        </p>
      )
    }
  }

  return elements
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { t } = useLanguage()
  const { blogPosts } = useBlogPosts()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [showToc, setShowToc] = useState(false)

  const translateCategory = (category: string) => {
    const key = categoryTranslationMap[category]
    if (key && (t.blog as Record<string, string>)[key]) {
      return (t.blog as Record<string, string>)[key]
    }
    return category
  }

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === params.slug)
    setPost(foundPost || null)
    setLoading(false)
  }, [blogPosts, params.slug])

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!post) return 0
    return calculateReadingTime(post.content || post.excerpt)
  }, [post])

  // Extract headings for TOC
  const headings = useMemo(() => {
    if (!post) return []
    return extractHeadings(post.content || '')
  }, [post])

  // Get related posts (same category, excluding current)
  const relatedPosts = useMemo(() => {
    if (!post) return []
    const sameCat = blogPosts.filter(
      p => p.category === post.category && p.id !== post.id
    )
    if (sameCat.length >= 2) return sameCat.slice(0, 3)
    // Fill with other posts if not enough same-category
    const others = blogPosts.filter(p => p.id !== post.id)
    return others.slice(0, 3)
  }, [post, blogPosts])

  // Build the share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t.common.loading}</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">{t.admin.blogNotFound}</p>
          <Link href="/blog" className="btn-primary inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.admin.backToBlog}
          </Link>
        </div>
      </div>
    )
  }

  // Find next and previous posts
  const currentIndex = blogPosts.findIndex(p => p.slug === params.slug)
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-96 w-full">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container-custom">
            <Link
              href="/blog"
              className="inline-flex items-center text-white hover:text-blue-200 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.admin.backToBlog}
            </Link>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Meta Info + Reading Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
              {translateCategory(post.category)}
            </span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime} {t.blog.minRead}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Share Buttons */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <ShareButtons title={post.title} url={shareUrl} />
          </div>

          {/* Table of Contents (if headings exist) */}
          {headings.length > 0 && (
            <div className="mb-8 bg-gray-50 rounded-lg border border-gray-200">
              <button
                onClick={() => setShowToc(!showToc)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold text-gray-900">
                    {t.blog.tableOfContents}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${showToc ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showToc && (
                <nav className="px-4 pb-4">
                  <ul className="space-y-2">
                    {headings.map((heading) => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                          onClick={() => setShowToc(false)}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 italic">
                {post.excerpt}
              </p>
            )}
            <div>
              {renderContentWithIds(post.content || post.excerpt)}
            </div>
          </div>

          {/* Share at bottom too */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <ShareButtons title={post.title} url={shareUrl} />
          </div>

          {/* Navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center text-primary-600 mb-2">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{t.admin.previousPost}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                    {prevPost.title}
                  </h3>
                </Link>
              ) : (
                <div />
              )}

              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group p-6 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all text-right"
                >
                  <div className="flex items-center justify-end text-primary-600 mb-2">
                    <span className="text-sm font-medium">{t.admin.nextPost}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                    {nextPost.title}
                  </h3>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {t.blog.relatedPosts}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group block"
                  >
                    <div className="relative h-40 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={related.image}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs text-primary-600 font-medium">
                      {translateCategory(related.category)}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 mt-1 line-clamp-2">
                      {related.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{calculateReadingTime(related.content || related.excerpt)} {t.blog.minRead}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.admin.backToBlog}
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
