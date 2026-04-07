/**
 * Tests for the sales tax calculator utility
 */
import { calculateSalesTax, getTaxRateInfo } from '@/lib/taxCalculator'

describe('calculateSalesTax', () => {
  it('calculates Texas sales tax correctly', () => {
    const result = calculateSalesTax('77001', 100)
    expect(result.state).toBe('TX')
    expect(result.rate).toBe(0.0825)
    expect(result.taxAmount).toBe(8.25)
  })

  it('calculates California sales tax correctly', () => {
    const result = calculateSalesTax('90001', 200)
    expect(result.state).toBe('CA')
    expect(result.rate).toBe(0.0825)
    expect(result.taxAmount).toBe(16.5)
  })

  it('returns zero tax for Delaware (no sales tax)', () => {
    const result = calculateSalesTax('19901', 500)
    expect(result.state).toBe('DE')
    expect(result.rate).toBe(0)
    expect(result.taxAmount).toBe(0)
  })

  it('returns zero tax for Oregon (no sales tax)', () => {
    const result = calculateSalesTax('97201', 1000)
    expect(result.state).toBe('OR')
    expect(result.rate).toBe(0)
    expect(result.taxAmount).toBe(0)
  })

  it('returns Unknown for invalid zip code', () => {
    const result = calculateSalesTax('00000', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('returns Unknown for empty zip code', () => {
    const result = calculateSalesTax('', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('returns Unknown for non-numeric zip code', () => {
    const result = calculateSalesTax('abcde', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('returns Unknown for too-short zip code', () => {
    const result = calculateSalesTax('770', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('handles large subtotals with proper rounding', () => {
    const result = calculateSalesTax('77001', 1699)
    expect(result.state).toBe('TX')
    expect(result.taxAmount).toBe(140.17)
  })

  it('handles zero subtotal', () => {
    const result = calculateSalesTax('77001', 0)
    expect(result.state).toBe('TX')
    expect(result.taxAmount).toBe(0)
  })
})

describe('getTaxRateInfo', () => {
  it('returns tax info for a valid Texas zip', () => {
    const info = getTaxRateInfo('77001')
    expect(info).not.toBeNull()
    expect(info!.state).toBe('TX')
    expect(info!.rate).toBe(0.0825)
  })

  it('returns null for an unknown zip code', () => {
    const info = getTaxRateInfo('00000')
    expect(info).toBeNull()
  })

  it('returns null for an invalid zip code', () => {
    const info = getTaxRateInfo('abc')
    expect(info).toBeNull()
  })
})
