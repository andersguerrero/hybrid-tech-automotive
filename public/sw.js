const CACHE_NAME = 'hybrid-tech-v1'
const STATIC_ASSETS = [
  '/',
  '/batteries',
  '/services',
  '/contact',
  '/faq',
  '/manifest.json',
  '/offline.html',
]

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Fetch - network first for API, cache first for static
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  if (request.url.includes('/api/')) {
    // Network first for API calls
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
  } else {
    // Cache first, then network for static assets
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => {
          // If both cache and network fail, show offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
          return new Response('Offline', { status: 503 })
        })
      )
    )
  }
})
