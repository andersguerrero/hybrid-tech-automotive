import { blobGet } from '@/lib/storage'
import { siteImages as defaultSiteImages } from '@/data/images'
import type { SiteImages } from '@/data/images'

interface ContactInfo {
  phone: string
  email: string
  address: string
  mapUrl?: string
}

interface BusinessHours {
  [key: string]: { open: string; close: string; closed?: boolean }
}

const DEFAULT_CONTACT: ContactInfo = {
  phone: '(832) 762-5299',
  email: 'info@hybridtechauto.com',
  address: '24422 Starview Landing Ct, Spring, TX 77373',
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://hybridtechauto.com'

// Convert "8:00 AM" → "08:00", "6:00 PM" → "18:00"
function to24h(timeStr: string): string {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return '00:00'
  let hours = parseInt(match[1])
  const minutes = match[2]
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

export async function LocalBusinessJsonLd() {
  let contact = DEFAULT_CONTACT
  let hours = DEFAULT_HOURS
  let siteImages = defaultSiteImages

  try {
    contact = await blobGet<ContactInfo>('config/contact-custom.json', 'contact-custom.json', DEFAULT_CONTACT)
  } catch { /* use defaults */ }

  try {
    hours = await blobGet<BusinessHours>('config/hours-custom.json', 'hours-custom.json', DEFAULT_HOURS)
  } catch { /* use defaults */ }

  try {
    siteImages = await blobGet<SiteImages>('config/site-images.json', 'site-images-custom.json', defaultSiteImages)
  } catch { /* use defaults */ }

  // Parse address parts
  const addressParts = contact.address.split(',').map(s => s.trim())
  const streetAddress = addressParts[0] || '24422 Starview Landing Ct'
  const city = addressParts[1] || 'Spring'
  const stateZip = (addressParts[2] || 'TX 77373').split(' ')
  const state = stateZip[0] || 'TX'
  const postalCode = stateZip[1] || '77373'

  // Build opening hours from dynamic data
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  const openingHoursSpec = []

  // Check if all weekdays have the same hours
  const weekdayHours = weekdays
    .filter(d => hours[d] && !hours[d].closed)
    .map(d => hours[d])

  if (weekdayHours.length > 0) {
    openingHoursSpec.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: weekdays
        .filter(d => hours[d] && !hours[d].closed)
        .map(d => d.charAt(0).toUpperCase() + d.slice(1)),
      opens: to24h(weekdayHours[0].open),
      closes: to24h(weekdayHours[0].close),
    })
  }

  if (hours.saturday && !hours.saturday.closed) {
    openingHoursSpec.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: to24h(hours.saturday.open),
      closes: to24h(hours.saturday.close),
    })
  }

  // Build logo URL
  const logoUrl = siteImages.logo?.startsWith('http')
    ? siteImages.logo
    : `${BASE_URL}${siteImages.logo || '/logo.jpg'}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Hybrid Tech Auto',
    legalName: 'Hybrid Tech Automotive LLC',
    url: BASE_URL,
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: city,
      addressRegion: state,
      postalCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.0799,
      longitude: -95.4194,
    },
    openingHoursSpecification: openingHoursSpec,
    priceRange: '$$',
    image: logoUrl,
    description:
      'Professional hybrid battery replacement and car services in Spring, TX. Expert repairs for Toyota, Lexus, and other hybrid vehicles.',
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: 30.0799, longitude: -95.4194 },
      geoRadius: '50000',
    },
    serviceType: [
      'Hybrid Battery Replacement',
      'Hybrid Battery Diagnostic',
      'Brake Replacement',
      'Suspension Inspection',
      'Coolant Flush',
      'Transmission Oil Service',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
