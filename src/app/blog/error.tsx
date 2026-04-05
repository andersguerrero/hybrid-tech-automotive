'use client'

import Link from 'next/link'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load blog</h2>
        <p className="text-gray-600 mb-6">
          We had trouble loading the blog. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
