import { track } from '@vercel/analytics'

export function trackEvent(name: string, data?: Record<string, string | number | boolean>) {
  track(name, data)
}
