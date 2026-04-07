import type { Battery, Service, BlogPost, Review } from '@/types'

export const mockBattery: Battery = {
  id: '1',
  vehicle: 'Toyota Prius (2010)',
  batteryType: 'Rebuilt NiMH',
  condition: 'refurbished',
  price: 899,
  warranty: '6 months',
  image: '/images/batteries/battery-test.webp',
  description: 'Professionally rebuilt and tested NiMH hybrid battery for Toyota Prius (2010).',
}

export const mockBatteryNew: Battery = {
  id: '2',
  vehicle: 'Toyota Prius (2010)',
  batteryType: 'New NiMH',
  condition: 'new',
  price: 1699,
  warranty: '3 years',
  image: '/images/batteries/battery-test.webp',
  description: 'Brand new factory-fresh NiMH hybrid battery pack for Toyota Prius (2010).',
}

export const mockBatteries: Battery[] = [mockBattery, mockBatteryNew]

export const mockService: Service = {
  id: '1',
  name: 'Suspension Inspection',
  price: 85,
  description: 'Complete suspension system inspection including shocks, struts, and bushings.',
  image: '/images/services/suspension-inspection.jpg',
  category: 'diagnostic',
}

export const mockServiceRepair: Service = {
  id: '2',
  name: 'Brake Replacement (per axle)',
  price: 190,
  description: 'Complete brake pad and rotor replacement for one axle with quality parts.',
  image: '/images/services/brake-replacement.jpg',
  category: 'repair',
}

export const mockServices: Service[] = [mockService, mockServiceRepair]

export const mockBlogPost: BlogPost = {
  id: '1',
  title: 'Understanding Hybrid Batteries',
  excerpt: 'Learn about hybrid battery technology and maintenance.',
  content: '<p>Full blog content here.</p>',
  author: 'Hybrid Tech Auto',
  publishedAt: '2024-01-15',
  category: 'Maintenance',
  image: '/images/blog/hybrid-batteries.jpg',
  slug: 'understanding-hybrid-batteries',
}

export const mockReview: Review = {
  id: '1',
  author: 'John Doe',
  rating: 5,
  comment: 'Great service and quality work!',
  date: '2024-01-10',
  verified: true,
}

export const mockBookingData = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '832-555-1234',
  service: 'Battery Replacement',
  date: '2024-02-01',
  time: '10:00',
  comments: 'Prius 2012 battery replacement needed',
  paymentMethod: 'cash',
}

export const mockContactData = {
  name: 'Bob Johnson',
  email: 'bob@example.com',
  phone: '832-555-5678',
  subject: 'Battery inquiry',
  message: 'I need a quote for a Prius battery replacement.',
}
