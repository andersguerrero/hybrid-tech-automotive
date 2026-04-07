import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Phone, Shield, Clock, ArrowRight, Star } from 'lucide-react'
import { cities } from '@/data/cities'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return cities.map(city => ({ city: city.slug }))
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = cities.find(c => c.slug === params.city)
  if (!city) return { title: 'Not Found' }

  return {
    title: `Hybrid Battery Replacement in ${city.fullName} | Hybrid Tech Auto`,
    description: city.description,
    openGraph: {
      title: `Hybrid Battery Replacement in ${city.fullName}`,
      description: city.description,
      type: 'website',
    },
  }
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = cities.find(c => c.slug === params.city)
  if (!city) notFound()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white section-padding">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Hybrid Battery Replacement in {city.fullName}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            {city.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
              Book Appointment <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="tel:+18327625299" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500 inline-flex items-center justify-center">
              <Phone className="mr-2 w-5 h-5" /> Call (832) 762-5299
            </a>
          </div>
        </div>
      </section>

      {/* Services for this city */}
      <section className="section-padding">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Hybrid Services in {city.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Shield className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Battery Replacement</h3>
              <p className="text-gray-600">New and refurbished hybrid batteries for Toyota, Lexus, and Honda vehicles with comprehensive warranties.</p>
            </div>
            <div className="card text-center">
              <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Battery Diagnostics</h3>
              <p className="text-gray-600">Advanced hybrid battery testing and cell-level diagnostics to identify issues before they become major problems.</p>
            </div>
            <div className="card text-center">
              <Clock className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Same-Day Service</h3>
              <p className="text-gray-600">Fast turnaround on most hybrid battery replacements. Get back on the road quickly with our efficient service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Why {city.name} Drivers Choose Hybrid Tech Auto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Conveniently Located</h3>
                <p className="text-gray-600">Our Spring, TX location is easily accessible from {city.name} via major highways.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Warranty-Backed</h3>
                <p className="text-gray-600">All our hybrid batteries come with comprehensive warranties up to 48 months.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Star className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">5-Star Rated</h3>
                <p className="text-gray-600">Rated 5.0 stars on Google by satisfied customers from {city.name} and surrounding areas.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Quotes</h3>
                <p className="text-gray-600">Call or WhatsApp us for a free quote on your hybrid battery replacement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="section-padding">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Hybrid Brands We Service</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">We specialize in hybrid battery replacement for the most popular hybrid vehicle brands.</p>
          <div className="flex flex-wrap justify-center gap-6">
            {['Toyota', 'Lexus', 'Honda'].map(brand => (
              <Link key={brand} href={`/batteries?brand=${brand}`} className="px-8 py-4 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-xl font-semibold text-gray-700 transition-colors text-lg">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary-500 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Hybrid Battery Service in {city.name}?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contact Hybrid Tech Auto today for professional hybrid battery service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-secondary text-lg px-8 py-4 inline-flex items-center">
              Book Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/batteries" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-500 inline-flex items-center">
              View Batteries
            </Link>
          </div>
        </div>
      </section>

      {/* Other service areas */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Service Areas</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.filter(c => c.slug !== city.slug).map(c => (
              <Link
                key={c.slug}
                href={`/services/${c.slug}`}
                className="px-4 py-2 bg-white rounded-full text-gray-700 hover:text-primary-500 hover:bg-primary-50 transition-colors text-sm font-medium shadow-sm"
              >
                {c.fullName}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
