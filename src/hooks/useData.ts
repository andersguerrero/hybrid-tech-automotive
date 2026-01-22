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
  // Initialize with initialBatteries to prevent empty array on first render
  const [batteries, setBatteries] = useState<Battery[]>(initialBatteries)

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
      if (loadedFromServer) return

      // Si no hay en servidor, cargar desde localStorage solo si existen datos editados desde admin
      const saved = localStorage.getItem('admin_batteries')
      const hasAdminEdits = localStorage.getItem('batteries_edited_by_admin')
      
      if (saved && hasAdminEdits === 'true') {
        try {
          const parsed = JSON.parse(saved)
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            console.log('Loaded from localStorage (admin edited):', parsed.length, 'batteries')
            setBatteries(parsed)
          } else {
            console.log('Invalid localStorage data, using initial batteries')
            setBatteries(initialBatteries)
          }
        } catch (e) {
          console.log('Error parsing localStorage, using initial:', initialBatteries.length, 'batteries')
          setBatteries(initialBatteries)
        }
      } else {
        console.log('Using fresh data from src/data/batteries.ts:', initialBatteries.length, 'batteries')
        setBatteries(initialBatteries)
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

  return batteries
}

export function useServices() {
  const [services, setServices] = useState<Service[]>(initialServices)

  useEffect(() => {
    const saved = localStorage.getItem('admin_services')
    if (saved) {
      try {
        setServices(JSON.parse(saved))
      } catch (e) {
        setServices(initialServices)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_services')
      if (saved) {
        try {
          setServices(JSON.parse(saved))
        } catch (e) {
          // Ignorar errores
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('servicesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('servicesUpdated', handleStorageChange)
    }
  }, [])

  return services
}

export function useBlogPosts() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts)

  useEffect(() => {
    const saved = localStorage.getItem('admin_blog')
    if (saved) {
      try {
        setBlogPosts(JSON.parse(saved))
      } catch (e) {
        setBlogPosts(initialBlogPosts)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_blog')
      if (saved) {
        try {
          setBlogPosts(JSON.parse(saved))
        } catch (e) {
          // Ignorar errores
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('blogUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('blogUpdated', handleStorageChange)
    }
  }, [])

  return blogPosts
}

export function useSiteImages() {
  const [siteImages, setSiteImages] = useState<SiteImages>(initialSiteImages)

  useEffect(() => {
    const saved = localStorage.getItem('admin_site_images')
    if (saved) {
      try {
        setSiteImages(JSON.parse(saved))
      } catch (e) {
        setSiteImages(initialSiteImages)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_site_images')
      if (saved) {
        try {
          setSiteImages(JSON.parse(saved))
        } catch (e) {
          // Ignorar errores
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('siteImagesUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('siteImagesUpdated', handleStorageChange)
    }
  }, [])

  return siteImages
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)

  useEffect(() => {
    const saved = localStorage.getItem('admin_reviews')
    if (saved) {
      try {
        setReviews(JSON.parse(saved))
      } catch (e) {
        setReviews(initialReviews)
      }
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin_reviews')
      if (saved) {
        try {
          setReviews(JSON.parse(saved))
        } catch (e) {
          // Ignorar errores
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('reviewsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('reviewsUpdated', handleStorageChange)
    }
  }, [])

  return reviews
}
