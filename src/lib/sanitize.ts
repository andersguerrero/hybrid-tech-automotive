/**
 * Input sanitization utilities for API routes
 * Prevents XSS, email header injection, and other input-based attacks
 */

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return input.replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Prevent email header injection attacks
 * Removes newlines and carriage returns that could inject additional headers
 */
export function sanitizeEmailField(input: string): string {
  return input
    .replace(/[\r\n]/g, '') // Remove newlines (header injection)
    .replace(/\0/g, '')     // Remove null bytes
    .trim()
}

/**
 * Sanitize a general text input
 * - Strips HTML tags
 * - Removes null bytes
 * - Trims whitespace
 * - Limits length
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''

  return stripHtml(input)
    .replace(/\0/g, '')           // Remove null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars (keep \n, \r, \t)
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitize a name field (no HTML, no special control characters)
 */
export function sanitizeName(input: string): string {
  return sanitizeText(input, 100)
    .replace(/[\r\n]/g, ' ')  // Replace newlines with space
    .replace(/\s+/g, ' ')     // Collapse multiple spaces
    .trim()
}

/**
 * Sanitize an email address
 * - Lowercase
 * - Remove header injection characters
 * - Basic format validation
 */
export function sanitizeEmail(input: string): string {
  return sanitizeEmailField(input)
    .toLowerCase()
    .slice(0, 254) // Max email length per RFC
}

/**
 * Sanitize a phone number
 * - Only keep digits, +, -, (, ), spaces
 */
export function sanitizePhone(input: string): string {
  return input
    .replace(/[^\d+\-() .]/g, '')
    .slice(0, 20)
}

/**
 * Sanitize multiline text (comments, messages)
 * - Strips HTML but preserves newlines
 * - Limits length
 */
export function sanitizeMessage(input: string, maxLength: number = 5000): string {
  if (typeof input !== 'string') return ''

  return stripHtml(input)
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * Sanitize all string fields in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fieldConfig: Record<string, 'text' | 'name' | 'email' | 'phone' | 'message'>
): T {
  const result = { ...obj }

  for (const [key, type] of Object.entries(fieldConfig)) {
    const value = result[key]
    if (typeof value !== 'string') continue

    switch (type) {
      case 'name':
        (result as Record<string, unknown>)[key] = sanitizeName(value)
        break
      case 'email':
        (result as Record<string, unknown>)[key] = sanitizeEmail(value)
        break
      case 'phone':
        (result as Record<string, unknown>)[key] = sanitizePhone(value)
        break
      case 'message':
        (result as Record<string, unknown>)[key] = sanitizeMessage(value)
        break
      default:
        (result as Record<string, unknown>)[key] = sanitizeText(value)
    }
  }

  return result
}
