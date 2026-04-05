export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Hybrid Tech Auto',
    legalName: 'Hybrid Tech Automotive LLC',
    url: 'https://hybridtechauto.com',
    telephone: '(832) 762-5299',
    email: 'info@hybridtechauto.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '24422 Starview Landing Ct',
      addressLocality: 'Spring',
      addressRegion: 'TX',
      postalCode: '77373',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.0799,
      longitude: -95.4194,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '15:00',
      },
    ],
    priceRange: '$$',
    image: 'https://hybridtechauto.com/favicon.svg',
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
