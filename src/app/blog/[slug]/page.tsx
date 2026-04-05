'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowLeft, ArrowRight } from 'lucide-react'
import { useBlogPosts } from '@/hooks/useData'
import { useLanguage } from '@/contexts/LanguageContext'
import type { BlogPost } from '@/types'
import { BLUR_DATA_URL } from '@/lib/imageUtils'

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { t } = useLanguage()
  const blogPosts = useBlogPosts()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.slug === params.slug)
    setPost(foundPost || null)
    setLoading(false)
  }, [blogPosts, params.slug])

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
          priority
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
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
          {/* Meta Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 italic">
                {post.excerpt}
              </p>
            )}
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {post.content || post.excerpt}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-gray-200">
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

          {/* Back to Blog */}
          <div className="mt-8 text-center">
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

