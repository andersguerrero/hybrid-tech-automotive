const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob', '@prisma/client'],
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/batteries',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/services',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/blog',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/reviews',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/api/site-images',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=120, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/hours',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
      {
        source: '/api/contact-info',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ]
  },
}

// Wrap with Sentry only when DSN is configured
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      // Suppress source map upload warnings when no auth token
      silent: !process.env.SENTRY_AUTH_TOKEN,
      // Disable source map upload if no auth token
      disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
      disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
      // Hide source maps from users
      hideSourceMaps: true,
      // Automatically tree-shake Sentry logger
      disableLogger: true,
    })
  : nextConfig
