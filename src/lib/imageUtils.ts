/**
 * Image optimization utilities
 * Provides blur placeholder data URLs for next/image
 */

/**
 * Tiny SVG blur placeholder (10x10px gray with blur)
 * Used as blurDataURL for remote images in next/image
 */
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
      <filter id="b"><feGaussianBlur stdDeviation="3"/></filter>
      <rect width="10" height="10" fill="#e2e8f0" filter="url(#b)"/>
    </svg>`
  ).toString('base64')

/**
 * Client-safe blur placeholder (no Buffer dependency)
 * For use in 'use client' components
 */
export const BLUR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 10 10%22%3E%3Cfilter id=%22b%22%3E%3CfeGaussianBlur stdDeviation=%223%22/%3E%3C/filter%3E%3Crect width=%2210%22 height=%2210%22 fill=%22%23e2e8f0%22 filter=%22url(%23b)%22/%3E%3C/svg%3E'
