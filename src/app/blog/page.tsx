'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useBlogPosts } from '@/hooks/useData'

export default function BlogPage() {
  const { t } = useLanguage()
  const blogPosts = useBlogPosts()
  
  // Si no hay posts, mostrar mensaje de carga
  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.blog.heroTitle}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.blog.heroDescription}
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {blogPosts[0] && (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-xl overflow-hidden">
              <Image
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                  {blogPosts[0].category}
                </span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blogPosts[0].publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900">
                {blogPosts[0].title}
              </h2>
              
              <p className="text-lg text-gray-600">
                {blogPosts[0].excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{blogPosts[0].author}</span>
                </div>
                
                <Link
                  href={`/blog/${blogPosts[0].slug}`}
                  className="btn-primary inline-flex items-center"
                >
                  {t.blog.readMore}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Blog Posts Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t.blog.latestArticlesTitle}
            </h2>
            <p className="text-lg text-gray-600">
              {t.blog.latestArticlesDesc}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="card hover:shadow-xl transition-shadow duration-300">
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
                      {post.category}
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
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest hybrid vehicle tips, 
            maintenance guides, and exclusive offers.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="btn-secondary px-6 py-3">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
