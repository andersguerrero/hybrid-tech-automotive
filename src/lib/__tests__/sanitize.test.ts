import {
  stripHtml,
  escapeHtml,
  sanitizeEmailField,
  sanitizeText,
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeMessage,
} from '../sanitize'

describe('stripHtml', () => {
  it('should remove HTML tags', () => {
    expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")')
  })

  it('should remove nested tags', () => {
    expect(stripHtml('<div><b>hello</b></div>')).toBe('hello')
  })

  it('should handle empty string', () => {
    expect(stripHtml('')).toBe('')
  })

  it('should keep plain text', () => {
    expect(stripHtml('hello world')).toBe('hello world')
  })

  it('should remove img tags with attributes', () => {
    expect(stripHtml('<img src="x" onerror="alert(1)">')).toBe('')
  })
})

describe('escapeHtml', () => {
  it('should escape special characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('should escape ampersand', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar')
  })

  it('should escape quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
  })
})

describe('sanitizeEmailField', () => {
  it('should remove newlines (header injection)', () => {
    expect(sanitizeEmailField('user@test.com\r\nBcc: hacker@evil.com')).toBe('user@test.comBcc: hacker@evil.com')
  })

  it('should remove null bytes', () => {
    expect(sanitizeEmailField('user\0@test.com')).toBe('user@test.com')
  })

  it('should trim whitespace', () => {
    expect(sanitizeEmailField('  user@test.com  ')).toBe('user@test.com')
  })
})

describe('sanitizeText', () => {
  it('should strip HTML and trim', () => {
    expect(sanitizeText('  <b>hello</b>  ')).toBe('hello')
  })

  it('should limit length', () => {
    const long = 'a'.repeat(2000)
    expect(sanitizeText(long, 100).length).toBe(100)
  })

  it('should remove control characters', () => {
    expect(sanitizeText('hello\x00\x01world')).toBe('helloworld')
  })

  it('should handle non-string input', () => {
    expect(sanitizeText(123 as unknown as string)).toBe('')
  })
})

describe('sanitizeName', () => {
  it('should clean a normal name', () => {
    expect(sanitizeName('John Doe')).toBe('John Doe')
  })

  it('should collapse multiple spaces', () => {
    expect(sanitizeName('John    Doe')).toBe('John Doe')
  })

  it('should remove HTML', () => {
    expect(sanitizeName('<script>alert(1)</script>John')).toBe('alert(1)John')
  })

  it('should limit to 100 chars', () => {
    const long = 'A'.repeat(200)
    expect(sanitizeName(long).length).toBe(100)
  })

  it('should replace newlines with space', () => {
    expect(sanitizeName('John\nDoe')).toBe('John Doe')
  })
})

describe('sanitizeEmail', () => {
  it('should lowercase', () => {
    expect(sanitizeEmail('User@TEST.com')).toBe('user@test.com')
  })

  it('should remove header injection', () => {
    expect(sanitizeEmail('user@test.com\r\nBcc:hack')).toBe('user@test.combcc:hack')
  })

  it('should limit length to 254', () => {
    const long = 'a'.repeat(300) + '@test.com'
    expect(sanitizeEmail(long).length).toBeLessThanOrEqual(254)
  })
})

describe('sanitizePhone', () => {
  it('should keep valid phone characters', () => {
    expect(sanitizePhone('(832) 762-5299')).toBe('(832) 762-5299')
  })

  it('should remove invalid characters', () => {
    expect(sanitizePhone('832-762-5299<script>')).toBe('832-762-5299')
  })

  it('should keep international format', () => {
    expect(sanitizePhone('+1 (832) 762-5299')).toBe('+1 (832) 762-5299')
  })

  it('should limit length to 20', () => {
    const long = '1'.repeat(30)
    expect(sanitizePhone(long).length).toBe(20)
  })
})

describe('sanitizeMessage', () => {
  it('should preserve newlines', () => {
    expect(sanitizeMessage('line1\nline2')).toBe('line1\nline2')
  })

  it('should strip HTML but keep content', () => {
    expect(sanitizeMessage('<p>Hello</p>\n<p>World</p>')).toBe('Hello\nWorld')
  })

  it('should limit to 5000 by default', () => {
    const long = 'a'.repeat(6000)
    expect(sanitizeMessage(long).length).toBe(5000)
  })

  it('should handle custom max length', () => {
    const long = 'a'.repeat(200)
    expect(sanitizeMessage(long, 100).length).toBe(100)
  })
})
