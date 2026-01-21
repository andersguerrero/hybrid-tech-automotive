export interface Battery {
  id: string
  vehicle: string
  batteryType: string
  condition: 'new' | 'refurbished'
  price: number
  warranty: string
  image: string
  description: string
}

export interface Service {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: 'maintenance' | 'repair' | 'diagnostic'
}

export interface BookingForm {
  name: string
  email: string
  phone: string
  service: string
  date: string
  time: string
  comments: string
  paymentMethod: 'stripe' | 'zelle' | 'cash'
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  category: string
  image: string
  slug: string
}

export interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  verified: boolean
}
