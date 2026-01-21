import { Service } from '@/types'

export const services: Service[] = [
  {
    id: '1',
    name: 'Suspension Inspection',
    price: 85,
    description: 'Complete suspension system inspection including shocks, struts, and bushings.',
    image: '/images/services/suspension-inspection.jpg',
    category: 'diagnostic'
  },
  {
    id: '2',
    name: 'Brake Replacement (per axle)',
    price: 190,
    description: 'Complete brake pad and rotor replacement for one axle with quality parts.',
    image: '/images/services/brake-replacement.jpg',
    category: 'repair'
  },
  {
    id: '3',
    name: 'Coolant Flush',
    price: 95,
    description: 'Complete cooling system flush and refill with appropriate coolant.',
    image: '/images/services/coolant-flush.jpg',
    category: 'maintenance'
  },
  {
    id: '4',
    name: 'Transmission Oil Service',
    price: 150,
    description: 'Transmission fluid change and filter replacement for optimal performance.',
    image: '/images/services/transmission-service.jpg',
    category: 'maintenance'
  },
  {
    id: '5',
    name: 'Hybrid Battery Diagnostic',
    price: 75,
    description: 'Comprehensive hybrid battery health check and performance analysis.',
    image: '/images/services/battery-diagnostic.jpg',
    category: 'diagnostic'
  }
]
