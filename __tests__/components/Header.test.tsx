/**
 * Tests for the Header component
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/Header'

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
  default: ({ children, href, onClick, ...rest }: any) => (
    <a href={href} onClick={onClick} {...rest}>{children}</a>
  ),
}))

// Mock useLanguage
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: {
      nav: {
        home: 'Home',
        services: 'Services',
        batteries: 'Batteries',
        reviews: 'Reviews',
        blog: 'Blog',
        contact: 'Contact',
      },
    },
  }),
}))

// Mock useSiteImages
jest.mock('@/hooks/useData', () => ({
  useSiteImages: () => ({
    logo: '/logo.jpg',
    heroImage: '/hero.jpg',
  }),
}))

// Mock Cart component
jest.mock('@/components/Cart', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="cart-drawer">Cart Drawer</div> : null
  ),
}))

// Track cart item count for different test scenarios
let mockCartItemCount = 0
jest.mock('@/contexts/CartContext', () => ({
  useCart: () => ({
    items: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getTotalPrice: () => 0,
    getTotalItems: () => mockCartItemCount,
  }),
}))

describe('Header', () => {
  beforeEach(() => {
    mockCartItemCount = 0
  })

  it('renders the logo', () => {
    render(<Header />)
    const logo = screen.getByAltText('Hybrid Tech Auto Logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders all desktop navigation links', () => {
    render(<Header />)
    // Desktop nav links (in the main nav)
    const navLinks = ['Home', 'Services', 'Batteries', 'Reviews', 'Blog', 'Contact']
    navLinks.forEach((linkText) => {
      const links = screen.getAllByText(linkText)
      expect(links.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('renders the Book Now button', () => {
    render(<Header />)
    const bookNowButtons = screen.getAllByText('Book Now')
    expect(bookNowButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders language switcher buttons', () => {
    render(<Header />)
    const enButtons = screen.getAllByText('EN')
    const esButtons = screen.getAllByText('ES')
    expect(enButtons.length).toBeGreaterThanOrEqual(1)
    expect(esButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('toggles mobile menu when hamburger button is clicked', () => {
    render(<Header />)
    const menuButton = screen.getByLabelText('Open menu')
    fireEvent.click(menuButton)

    // After clicking, mobile nav should appear with an id
    const mobileNav = document.getElementById('mobile-navigation')
    expect(mobileNav).toBeInTheDocument()
  })

  it('closes mobile menu when close button is clicked', () => {
    render(<Header />)
    // Open menu
    const openButton = screen.getByLabelText('Open menu')
    fireEvent.click(openButton)
    expect(document.getElementById('mobile-navigation')).toBeInTheDocument()

    // Close menu
    const closeButton = screen.getByLabelText('Close menu')
    fireEvent.click(closeButton)
    expect(document.getElementById('mobile-navigation')).not.toBeInTheDocument()
  })

  it('displays cart count badge when items are in cart', () => {
    mockCartItemCount = 3
    render(<Header />)

    // Should show the cart count (aria-label includes the count)
    const cartLinks = screen.getAllByLabelText(/Shopping cart, 3 items/)
    expect(cartLinks.length).toBeGreaterThanOrEqual(1)
  })

  it('does not display cart count badge when cart is empty', () => {
    mockCartItemCount = 0
    render(<Header />)

    // Should have "Shopping cart" without a count
    const cartButtons = screen.getAllByLabelText('Shopping cart')
    expect(cartButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders skip-to-content link for accessibility', () => {
    render(<Header />)
    const skipLink = screen.getByText('Skip to content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })
})
