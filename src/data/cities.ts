export interface City {
  slug: string
  name: string
  state: string
  fullName: string
  description: string
  descriptionEs: string
  coordinates: { lat: number; lng: number }
}

export const cities: City[] = [
  {
    slug: 'spring-tx',
    name: 'Spring',
    state: 'TX',
    fullName: 'Spring, TX',
    description: 'Professional hybrid battery replacement and repair services in Spring, Texas. Serving the Spring community with expert Toyota, Lexus, and Honda hybrid vehicle services.',
    descriptionEs: 'Servicios profesionales de reemplazo y reparación de baterías híbridas en Spring, Texas. Atendemos a la comunidad de Spring con servicios expertos para vehículos híbridos Toyota, Lexus y Honda.',
    coordinates: { lat: 30.0799, lng: -95.4172 }
  },
  {
    slug: 'houston-tx',
    name: 'Houston',
    state: 'TX',
    fullName: 'Houston, TX',
    description: 'Expert hybrid battery services for Houston drivers. Convenient location in North Houston with affordable pricing on Toyota, Lexus, and Honda hybrid batteries.',
    descriptionEs: 'Servicios expertos de baterías híbridas para conductores de Houston. Ubicación conveniente en el norte de Houston con precios accesibles en baterías híbridas Toyota, Lexus y Honda.',
    coordinates: { lat: 29.7604, lng: -95.3698 }
  },
  {
    slug: 'the-woodlands-tx',
    name: 'The Woodlands',
    state: 'TX',
    fullName: 'The Woodlands, TX',
    description: 'Hybrid battery replacement near The Woodlands, TX. Just minutes away, our certified technicians provide expert hybrid battery service for all makes.',
    descriptionEs: 'Reemplazo de baterías híbridas cerca de The Woodlands, TX. A solo minutos de distancia, nuestros técnicos certificados brindan servicio experto de baterías híbridas.',
    coordinates: { lat: 30.1658, lng: -95.4613 }
  },
  {
    slug: 'tomball-tx',
    name: 'Tomball',
    state: 'TX',
    fullName: 'Tomball, TX',
    description: 'Affordable hybrid battery service near Tomball, Texas. Our technicians specialize in Toyota Prius, Camry, Highlander, and Lexus hybrid batteries.',
    descriptionEs: 'Servicio accesible de baterías híbridas cerca de Tomball, Texas. Nuestros técnicos se especializan en baterías híbridas Toyota Prius, Camry, Highlander y Lexus.',
    coordinates: { lat: 30.0972, lng: -95.6161 }
  },
  {
    slug: 'conroe-tx',
    name: 'Conroe',
    state: 'TX',
    fullName: 'Conroe, TX',
    description: 'Hybrid battery replacement serving Conroe, TX. Professional installation and diagnostics with warranty-backed hybrid batteries.',
    descriptionEs: 'Reemplazo de baterías híbridas para Conroe, TX. Instalación profesional y diagnósticos con baterías híbridas respaldadas por garantía.',
    coordinates: { lat: 30.3119, lng: -95.4560 }
  },
  {
    slug: 'humble-tx',
    name: 'Humble',
    state: 'TX',
    fullName: 'Humble, TX',
    description: 'Quality hybrid battery service near Humble, Texas. New and refurbished hybrid batteries for Toyota, Lexus, and Honda vehicles.',
    descriptionEs: 'Servicio de calidad de baterías híbridas cerca de Humble, Texas. Baterías híbridas nuevas y reacondicionadas para vehículos Toyota, Lexus y Honda.',
    coordinates: { lat: 29.9988, lng: -95.2622 }
  },
  {
    slug: 'cypress-tx',
    name: 'Cypress',
    state: 'TX',
    fullName: 'Cypress, TX',
    description: 'Hybrid battery experts serving Cypress, TX. Get your hybrid battery replaced or repaired with fast turnaround and competitive pricing.',
    descriptionEs: 'Expertos en baterías híbridas para Cypress, TX. Reemplace o repare su batería híbrida con un tiempo de respuesta rápido y precios competitivos.',
    coordinates: { lat: 29.9691, lng: -95.6970 }
  },
  {
    slug: 'katy-tx',
    name: 'Katy',
    state: 'TX',
    fullName: 'Katy, TX',
    description: 'Hybrid battery replacement services for Katy, TX drivers. Expert technicians, quality parts, and comprehensive warranties.',
    descriptionEs: 'Servicios de reemplazo de baterías híbridas para conductores de Katy, TX. Técnicos expertos, partes de calidad y garantías integrales.',
    coordinates: { lat: 29.7858, lng: -95.8245 }
  }
]
