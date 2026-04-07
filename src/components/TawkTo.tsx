'use client'

import { useEffect } from 'react'

/**
 * Tawk.to live chat widget integration.
 *
 * Requires the NEXT_PUBLIC_TAWK_PROPERTY_ID environment variable to be set.
 * Get your property ID from https://dashboard.tawk.to/ after creating a property.
 * The value looks like: "XXXXXXXXXXXXXXXXXXXXXXXX/YYYYYYYYYY"
 *
 * Example .env.local entry:
 *   NEXT_PUBLIC_TAWK_PROPERTY_ID=your_property_id_here
 */
export default function TawkTo() {
  useEffect(() => {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
    if (!propertyId) return

    const s = document.createElement('script')
    s.async = true
    s.src = `https://embed.tawk.to/${propertyId}/default`
    s.charset = 'UTF-8'
    s.setAttribute('crossorigin', '*')
    document.body.appendChild(s)

    return () => {
      // Cleanup on unmount
      if (s.parentNode) {
        s.parentNode.removeChild(s)
      }
    }
  }, [])

  return null
}
