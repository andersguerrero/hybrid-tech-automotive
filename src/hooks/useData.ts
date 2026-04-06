import { useState, useEffect } from 'react'
import { batteries as initialBatteries } from '@/data'
import { services as initialServices } from '@/data'
import { blogPosts as initialBlogPosts } from '@/data'
import { siteImages as initialSiteImages } from '@/data'
import { reviews as initialReviews } from '@/data'
import type { Battery } from '@/types'
import type { Service } from '@/types'
import type { BlogPost } from '@/types'
import type { SiteImages } from '@/data/images'
import type { Review } from '@/types'

export function useBatteries() {
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const loadBatteries = async () => {
      try {
        const response = await fetch('/api/batteries')
        const data = await response.json()
        if (data.success && Array.isArray(data.batteries)) {
          setBatteries(data.batteries)
          setIsReady(true)
          return
        }
      } catch (error) {
        console.error('Error loading batteries from server:', error)
      }
      // On error, keep empty — no fallback to static data
      setIsReady(true)
    }
    loadBatteries()
  }, [])


  return { batteries, isReady }
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([])

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.success && Array.isArray(data.services)) {
        setServices(data.services)
        return
      }
    } catch (error) {
      console.error('Error loading services from API:', error)
    }
    // Fallback only on network error
    setServices(initialServices)
  }

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadServices()
    }

    window.addEventListener('servicesUpdated', handleUpdate)

    return () => {
      window.removeEventListener('servicesUpdated', handleUpdate)
    }
  }, [])

  return services
}

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])

  const loadBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      if (data.success && Array.isArray(data.blogPosts)) {
        setBlogPosts(data.blogPosts)
        return
      }
    } catch (error) {
      console.error('Error loading blog posts from API:', error)
    }
    // Fallback only on network error
    setBlogPosts(initialBlogPosts)
  }

  useEffect(() => {
    loadBlogPosts()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadBlogPosts()
    }

    window.addEventListener('blogUpdated', handleUpdate)

    return () => {
      window.removeEventListener('blogUpdated', handleUpdate)
    }
  }, [])

  return blogPosts
}

export function useSiteImages() {
  const [siteImages, setSiteImages] = useState<SiteImages>(initialSiteImages)

  const loadSiteImages = async () => {
    try {
      const response = await fetch('/api/site-images')
      const data = await response.json()
      if (data.success && data.siteImages) {
        setSiteImages(data.siteImages)
        return
      }
    } catch (error) {
      console.error('Error loading site images from API:', error)
    }
    // Fallback only on network error
    setSiteImages(initialSiteImages)
  }

  useEffect(() => {
    loadSiteImages()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadSiteImages()
    }

    window.addEventListener('siteImagesUpdated', handleUpdate)

    return () => {
      window.removeEventListener('siteImagesUpdated', handleUpdate)
    }
  }, [])

  return siteImages
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([])

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      const data = await response.json()
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews)
        return
      }
    } catch (error) {
      console.error('Error loading reviews from API:', error)
    }
    // Fallback only on network error
    setReviews(initialReviews)
  }

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadReviews()
    }

    window.addEventListener('reviewsUpdated', handleUpdate)

    return () => {
      window.removeEventListener('reviewsUpdated', handleUpdate)
    }
  }, [])

  return reviews
}

// ─── Contact Info ─────────────────────────────────────────────────────────────

interface ContactInfo {
  phone: string
  email: string
  address: string
  mapUrl?: string
}

const DEFAULT_CONTACT: ContactInfo = {
  phone: '(832) 762-5299',
  email: 'info@hybridtechauto.com',
  address: '24422 Starview Landing Ct, Spring, TX 77373',
}

export function useContactInfo() {
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT)

  useEffect(() => {
    const loadContact = async () => {
      try {
        const response = await fetch('/api/contact-info')
        const data = await response.json()
        if (data.success && data.contact) {
          setContact(data.contact)
        }
      } catch (error) {
        console.error('Error loading contact info:', error)
      }
    }
    loadContact()
  }, [])

  // Derive useful values
  const phoneRaw = contact.phone.replace(/[^+\d]/g, '')
  const phoneTel = phoneRaw.startsWith('+') ? phoneRaw : `+1${phoneRaw}`
  const mapEmbedUrl = contact.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`

  return { ...contact, phoneTel, mapEmbedUrl }
}

// ─── Business Hours ───────────────────────────────────────────────────────────

interface DayHours {
  open: string
  close: string
  closed?: boolean
}

interface BusinessHours {
  [key: string]: DayHours
}

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: '8:00 AM', close: '6:00 PM' },
  tuesday: { open: '8:00 AM', close: '6:00 PM' },
  wednesday: { open: '8:00 AM', close: '6:00 PM' },
  thursday: { open: '8:00 AM', close: '6:00 PM' },
  friday: { open: '8:00 AM', close: '6:00 PM' },
  saturday: { open: '9:00 AM', close: '3:00 PM' },
  sunday: { open: '', close: '', closed: true },
}

export function useBusinessHours() {
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS)

  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await fetch('/api/hours')
        const data = await response.json()
        if (data.success && data.hours) {
          setHours(data.hours)
        }
      } catch (error) {
        console.error('Error loading business hours:', error)
      }
    }
    loadHours()
  }, [])

  // Format for display
  const formatDay = (day: DayHours) =>
    day.closed ? 'Closed' : `${day.open} - ${day.close}`

  const weekdayHours = formatDay(hours.monday || DEFAULT_HOURS.monday)
  const saturdayHours = formatDay(hours.saturday || DEFAULT_HOURS.saturday)
  const sundayHours = formatDay(hours.sunday || DEFAULT_HOURS.sunday)

  return { hours, weekdayHours, saturdayHours, sundayHours }
}
