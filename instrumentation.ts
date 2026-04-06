export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import server-side Sentry config (only when DSN is set)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import('./sentry.server.config')
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      await import('./sentry.edge.config')
    }
  }
}
