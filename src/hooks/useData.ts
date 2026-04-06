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
  const [batteries, setBatteries] = useState<Battery[]>(initialBatteries)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Primero intentar cargar desde el servidor
    const loadFromServer = async () => {
      try {
        const response = await fetch('/api/batteries')
        const data = await response.json()
        if (data.success && data.batteries && data.batteries.length > 0) {
          console.log('Loaded batteries from server:', data.batteries.length)
          setBatteries(data.batteries)
          // Guardar en localStorage para compatibilidad
          localStorage.setItem('admin_batteries', JSON.stringify(data.batteries))
          localStorage.setItem('batteries_edited_by_admin', 'true')
          return true
        }
      } catch (error) {
        console.error('Error loading from server:', error)
      }
      return false
    }

    // Intentar cargar desde servidor primero
    loadFromServer().then(loadedFromServer => {
      if (loadedFromServer) {
        setIsReady(true)
        return
      }

      // Si no hay en servidor, cargar desde localStorage solo si existen datos editados desde admin
      const saved = localStorage.getItem('admin_batteries')
      const hasAdminEdits = localStorage.getItem('batteries_edited_by_admin')
      
      if (saved && hasAdminEdits === 'true') {
      try {
        const parsed = JSON.parse(saved)
        // Verificar si los datos son consistentes con el archivo (mismo número de baterías)
        // Si no coinciden, usar datos del archivo y limpiar localStorage
        if (parsed.length !== initialBatteries.length) {
          console.log('Inconsistent battery count, using fresh data from src/data/batteries.ts')
          localStorage.removeItem('admin_batteries')
          localStorage.removeItem('batteries_edited_by_admin')
          setBatteries(initialBatteries)
          setIsReady(true)
        } else {
          // Verificar si hay diferencias en precios de baterías de Prius, Prius V, Lexus GS450h, HS250h y Toyota Highlander
          // Comparar precios entre localStorage y archivo
          const targetBatteriesInFile = initialBatteries.filter(
            b => (
              (b.vehicle.startsWith('Toyota Prius (') || b.vehicle.startsWith('Toyota Prius V (')) && b.condition === 'new'
            ) || (
              b.vehicle.startsWith('Lexus GS450h (') && (b.condition === 'new' || b.condition === 'refurbished')
            ) || (
              b.vehicle.startsWith('Lexus HS250h (') && (b.condition === 'new' || b.condition === 'refurbished')
            ) || (
              b.vehicle.startsWith('Toyota Highlander (') && (b.condition === 'new' || b.condition === 'refurbished')
            )
          )
          const targetBatteriesInStorage = parsed.filter(
            (b: Battery) => (
              (b.vehicle.startsWith('Toyota Prius (') || b.vehicle.startsWith('Toyota Prius V (')) && b.condition === 'new'
            ) || (
              b.vehicle.startsWith('Lexus GS450h (') && (b.condition === 'new' || b.condition === 'refurbished')
            ) || (
              b.vehicle.startsWith('Lexus HS250h (') && (b.condition === 'new' || b.condition === 'refurbished')
            ) || (
              b.vehicle.startsWith('Toyota Highlander (') && (b.condition === 'new' || b.condition === 'refurbished')
            )
          )
          
          // Verificar si hay diferencias en precios
          let hasPriceDifference = false
          for (const fileBattery of targetBatteriesInFile) {
            const storageBattery = targetBatteriesInStorage.find(
              (b: Battery) => b.id === fileBattery.id
            )
            if (storageBattery && storageBattery.price !== fileBattery.price) {
              hasPriceDifference = true
              console.log(`Price mismatch for battery ${fileBattery.id} (${fileBattery.vehicle}): storage=${storageBattery.price}, file=${fileBattery.price}`)
              break
            }
          }
          
          if (hasPriceDifference) {
            console.log('Price differences detected, using fresh data from src/data/batteries.ts')
            localStorage.removeItem('admin_batteries')
            localStorage.removeItem('batteries_edited_by_admin')
            setBatteries(initialBatteries)
            setIsReady(true)
          } else {
            console.log('Loaded from localStorage (admin edited):', parsed.length, 'batteries')
            setBatteries(parsed)
            setIsReady(true)
          }
        }
      } catch (e) {
        console.log('Error parsing localStorage, using initial:', initialBatteries.length, 'batteries')
        localStorage.removeItem('admin_batteries')
        localStorage.removeItem('batteries_edited_by_admin')
        setBatteries(initialBatteries)
        setIsReady(true)
      }
    } else {
      console.log('Using fresh data from src/data/batteries.ts:', initialBatteries.length, 'batteries')
      // Clear old localStorage data if no admin edits
      if (saved) {
        localStorage.removeItem('admin_batteries')
      }
      if (hasAdminEdits) {
        localStorage.removeItem('batteries_edited_by_admin')
      }
      setBatteries(initialBatteries)
      setIsReady(true)
    }
    })
  }, [])

  useEffect(() => {
    // Escuchar cambios en localStorage (desde otras pestañas)
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_batteries')
      const hasAdminEdits = localStorage.getItem('batteries_edited_by_admin')
      
      if (saved && hasAdminEdits === 'true') {
        try {
          const parsed = JSON.parse(saved)
          console.log('Storage changed (admin edited):', parsed.length, 'batteries')
          setBatteries(parsed)
        } catch (e) {
          console.error('Error parsing storage change')
        }
      } else if (saved) {
        // Clear old data if no admin edits marker
        localStorage.removeItem('admin_batteries')
      }
    }

    // Escuchar eventos de almacenamiento
    window.addEventListener('storage', handleStorageChange)
    
    // Escuchar eventos personalizados (misma pestaña)
    window.addEventListener('batteriesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('batteriesUpdated', handleStorageChange)
    }
  }, [])

  return { batteries, isReady }
}

export function useServices() {
  const [services, setServices] = useState<Service[]>(initialServices)

  const loadServices = async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.success && data.services && data.services.length > 0) {
        setServices(data.services)
        localStorage.setItem('admin_services', JSON.stringify(data.services))
        return
      }
    } catch (error) {
      console.error('Error loading services from API:', error)
    }
    const saved = localStorage.getItem('admin_services')
    if (saved) {
      try {
        setServices(JSON.parse(saved))
      } catch {
        setServices(initialServices)
      }
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadServices()
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('servicesUpdated', handleUpdate)

    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('servicesUpdated', handleUpdate)
    }
  }, [])

  return services
}

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts)

  const loadBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      if (data.success && data.blogPosts && data.blogPosts.length > 0) {
        setBlogPosts(data.blogPosts)
        localStorage.setItem('admin_blog', JSON.stringify(data.blogPosts))
        return
      }
    } catch (error) {
      console.error('Error loading blog posts from API:', error)
    }
    const saved = localStorage.getItem('admin_blog')
    if (saved) {
      try {
        setBlogPosts(JSON.parse(saved))
      } catch {
        setBlogPosts(initialBlogPosts)
      }
    }
  }

  useEffect(() => {
    loadBlogPosts()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadBlogPosts()
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('blogUpdated', handleUpdate)

    return () => {
      window.removeEventListener('storage', handleUpdate)
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
        localStorage.setItem('admin_site_images', JSON.stringify(data.siteImages))
        return
      }
    } catch (error) {
      console.error('Error loading site images from API:', error)
    }
    // Fallback: localStorage o defaults
    const saved = localStorage.getItem('admin_site_images')
    if (saved) {
      try {
        setSiteImages(JSON.parse(saved))
      } catch {
        setSiteImages(initialSiteImages)
      }
    }
  }

  useEffect(() => {
    loadSiteImages()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadSiteImages()
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('siteImagesUpdated', handleUpdate)

    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('siteImagesUpdated', handleUpdate)
    }
  }, [])

  return siteImages
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      const data = await response.json()
      if (data.success && data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews)
        localStorage.setItem('admin_reviews', JSON.stringify(data.reviews))
        return
      }
    } catch (error) {
      console.error('Error loading reviews from API:', error)
    }
    const saved = localStorage.getItem('admin_reviews')
    if (saved) {
      try {
        setReviews(JSON.parse(saved))
      } catch {
        setReviews(initialReviews)
      }
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      loadReviews()
    }

    window.addEventListener('storage', handleUpdate)
    window.addEventListener('reviewsUpdated', handleUpdate)

    return () => {
      window.removeEventListener('storage', handleUpdate)
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
