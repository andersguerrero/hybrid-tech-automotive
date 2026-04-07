/**
 * Tests for the ServiceCard component
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ServiceCard from '@/components/ServiceCard'
import { mockService, mockServiceRepair } from '../mocks/data'

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
      services: {
        bookNow: 'Book Now',
        categoryDiagnostic: 'Diagnostic',
        categoryRepair: 'Repair',
        categoryMaintenance: 'Maintenance',
        suspensionInspection: 'Suspension Inspection',
        suspensionDesc: 'Complete suspension system inspection including shocks, struts, and bushings.',
        brakeReplacement: 'Brake Replacement (per axle)',
        brakeDesc: 'Complete brake pad and rotor replacement for one axle with quality parts.',
      },
    },
  }),
}))

// Mock useCart
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    items: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getTotalPrice: () => 0,
    getTotalItems: () => 0,
  }),
  CartProvider: ({ children }: any) => <>{children}</>,
}))

describe('ServiceCard', () => {
  it('renders service name', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText('Suspension Inspection')).toBeInTheDocument()
  })

  it('renders service price', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText('$85')).toBeInTheDocument()
  })

  it('renders service description', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText(mockService.description)).toBeInTheDocument()
  })

  it('renders diagnostic category badge', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText('Diagnostic')).toBeInTheDocument()
  })

  it('renders repair category badge for repair services', () => {
    render(<ServiceCard service={mockServiceRepair} />)
    expect(screen.getByText('Repair')).toBeInTheDocument()
  })

  it('renders the Book Now link', () => {
    render(<ServiceCard service={mockService} />)
    const link = screen.getByText('Book Now').closest('a')
    expect(link).toHaveAttribute('href', '/booking')
  })

  it('renders the service image', () => {
    render(<ServiceCard service={mockService} />)
    const img = screen.getByAltText(mockService.name)
    expect(img).toBeInTheDocument()
  })

  it('renders the Add to Cart button', () => {
    render(<ServiceCard service={mockService} />)
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })
})
