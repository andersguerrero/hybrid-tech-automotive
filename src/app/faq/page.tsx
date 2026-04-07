'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, ChevronDown, Phone, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { faqs, type FAQItem } from '@/data/faq'

// Category mapping for filtering
const categoryMap: Record<string, string> = {
  'General': 'categoryGeneral',
  'Hybrid Batteries': 'categoryBatteries',
  'Services': 'categoryServices',
  'Pricing': 'categoryPricing',
  'Warranty': 'categoryWarranty',
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  searchQuery,
  locale,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
  searchQuery: string
  locale: string
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  const question = locale === 'es' ? item.questionEs : item.question
  const answer = locale === 'es' ? item.answerEs : item.answer

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-gray-900 pr-4">
          {highlightText(question, searchQuery)}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        style={{ maxHeight: `${height}px` }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <div ref={contentRef} className="px-5 pb-5">
          <p className="text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const { t, locale } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map(f => f.category)))
    return cats
  }, [])

  // Translate category
  const translateCategory = (category: string) => {
    const key = categoryMap[category]
    if (key && (t.faq as Record<string, string>)[key]) {
      return (t.faq as Record<string, string>)[key]
    }
    return locale === 'es'
      ? faqs.find(f => f.category === category)?.categoryEs || category
      : category
  }

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const question = locale === 'es' ? faq.questionEs : faq.question
      const answer = locale === 'es' ? faq.answerEs : faq.answer

      const matchesSearch =
        searchQuery === '' ||
        question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answer.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, locale])

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Schema.org FAQ structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: locale === 'es' ? faq.questionEs : faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: locale === 'es' ? faq.answerEs : faq.answer,
      },
    })),
  }

  return (
    <>
      {/* FAQ Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gray-50 section-padding">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t.faq.heroTitle}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.faq.heroDescription}
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="bg-white border-b border-gray-200 py-6">
          <div className="container-custom">
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.faq.searchPlaceholder}
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

            {/* Category Tabs - horizontal scrollable on mobile */}
            <div className="flex overflow-x-auto gap-2 pb-2 justify-center scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.faq.allCategories}
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
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
                {t.faq.showingResults} {filteredFaqs.length} {t.faq.ofResults} {faqs.length} {t.faq.questions}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="section-padding bg-gray-50">
          <div className="container-custom max-w-3xl">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t.faq.noResultsTitle}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {t.faq.noResultsDesc}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="mt-6 btn-primary"
                >
                  {t.faq.allCategories}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map(faq => (
                  <FAQAccordionItem
                    key={faq.id}
                    item={faq}
                    isOpen={openItems.has(faq.id)}
                    onToggle={() => toggleItem(faq.id)}
                    searchQuery={searchQuery}
                    locale={locale}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-primary-500 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.faq.stillHaveQuestions}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t.faq.contactUsDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+18327625299"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                {t.faq.callUs}: (832) 762-5299
              </a>
              <a
                href="https://wa.me/18327625299"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {t.faq.whatsappUs}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
