import * as Sentry from '@sentry/nextjs'

// Only initialize if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,

    // Performance monitoring: sample 10% of transactions in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay: capture 1% of sessions, 100% of error sessions
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    // Only send errors, not console messages
    integrations: [
      Sentry.replayIntegration(),
    ],

    // Filter out noisy errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error exception captured',
      /Loading chunk \d+ failed/,
    ],

    // Don't send PII by default
    sendDefaultPii: false,
  })
}
