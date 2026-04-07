/**
 * Tests for the BatteryCard component
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import BatteryCard from '@/components/BatteryCard'
import { mockBattery, mockBatteryNew } from '../mocks/data'

// Mock next/image - filter out Next.js-specific boolean props
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, sizes, ...props }: any) => {
    return <img {...props} />
  },
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>{children}</a>
  ),
}))

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}))

// Mock useLanguage
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: {
      batteries: {
        startingPrice: 'Starting price',
        getQuote: 'Get Quote',
      },
    },
  }),
}))

// Mock useCart and useAddToCart
const mockAddToCart = jest.fn()
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    items: [],
    addToCart: mockAddToCart,
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getTotalPrice: () => 0,
    getTotalItems: () => 0,
  }),
  CartProvider: ({ children }: any) => <>{children}</>,
}))

describe('BatteryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders battery vehicle name', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText('Toyota Prius (2010)')).toBeInTheDocument()
  })

  it('renders battery price', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText('$899')).toBeInTheDocument()
  })

  it('renders battery type', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText('Rebuilt NiMH')).toBeInTheDocument()
  })

  it('renders warranty info', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText('6 months')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText(mockBattery.description)).toBeInTheDocument()
  })

  it('renders the Add to Cart button', () => {
    render(<BatteryCard battery={mockBattery} />)
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  it('renders the Get Quote link pointing to /booking', () => {
    render(<BatteryCard battery={mockBattery} />)
    const link = screen.getByText('Get Quote').closest('a')
    expect(link).toHaveAttribute('href', '/booking')
  })

  it('renders the battery image with correct alt text', () => {
    render(<BatteryCard battery={mockBattery} />)
    const img = screen.getByAltText('Toyota Prius (2010)')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', mockBattery.image)
  })

  it('displays a higher price for new batteries', () => {
    render(<BatteryCard battery={mockBatteryNew} />)
    expect(screen.getByText('$1699')).toBeInTheDocument()
  })

  it('calls addToCart when the Add to Cart button is clicked', () => {
    render(<BatteryCard battery={mockBattery} />)
    const button = screen.getByText('Add to Cart')
    fireEvent.click(button)
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'battery-1',
        name: 'Toyota Prius (2010)',
        price: 899,
        type: 'battery',
      })
    )
  })
})
