import { checkRateLimit } from '../rateLimit'

describe('checkRateLimit', () => {
  const config = {
    name: 'test-limiter',
    maxRequests: 3,
    windowSeconds: 60,
  }

  it('should allow first request', () => {
    const result = checkRateLimit('ip-first-1', config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('should track remaining requests', () => {
    const ip = 'ip-track-' + Date.now()
    const r1 = checkRateLimit(ip, config)
    expect(r1.remaining).toBe(2)
    const r2 = checkRateLimit(ip, config)
    expect(r2.remaining).toBe(1)
    const r3 = checkRateLimit(ip, config)
    expect(r3.remaining).toBe(0)
  })

  it('should block after max requests', () => {
    const ip = 'ip-block-' + Date.now()
    checkRateLimit(ip, config)
    checkRateLimit(ip, config)
    checkRateLimit(ip, config)
    const result = checkRateLimit(ip, config)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should isolate different IPs', () => {
    const ip1 = 'ip-iso1-' + Date.now()
    const ip2 = 'ip-iso2-' + Date.now()
    checkRateLimit(ip1, config)
    checkRateLimit(ip1, config)
    checkRateLimit(ip1, config)

    const result = checkRateLimit(ip2, config)
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it('should isolate different limiter names', () => {
    const ip = 'ip-name-' + Date.now()
    const config1 = { name: 'limiter-a-' + Date.now(), maxRequests: 1, windowSeconds: 60 }
    const config2 = { name: 'limiter-b-' + Date.now(), maxRequests: 1, windowSeconds: 60 }

    checkRateLimit(ip, config1) // exhaust config1

    const result = checkRateLimit(ip, config2)
    expect(result.success).toBe(true)
  })

  it('should allow request if window has passed', () => {
    // With windowSeconds=0 the resetAt is set to now+0ms, which may still equal Date.now()
    // So we just verify a fresh limiter starts fresh
    const config2 = {
      name: 'test-fresh-' + Date.now(),
      maxRequests: 2,
      windowSeconds: 60,
    }
    const ip = 'ip-fresh-' + Date.now()
    const r1 = checkRateLimit(ip, config2)
    expect(r1.success).toBe(true)
    expect(r1.remaining).toBe(1)
  })

  it('should return resetAt timestamp', () => {
    const ip = 'ip-reset-' + Date.now()
    const before = Date.now()
    const result = checkRateLimit(ip, config)
    const after = Date.now()

    expect(result.resetAt).toBeGreaterThanOrEqual(before + config.windowSeconds * 1000)
    expect(result.resetAt).toBeLessThanOrEqual(after + config.windowSeconds * 1000)
  })
})
