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

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'service' | 'battery'
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'stripe' | 'zelle' | 'cash'
  paymentStatus: 'pending' | 'paid' | 'failed'
  orderStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string
  time: string
  comments: string
  stripeSessionId?: string
  createdAt: string
  updatedAt: string
}
