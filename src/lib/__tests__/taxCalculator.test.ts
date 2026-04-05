import { calculateSalesTax, getTaxRateInfo } from '../taxCalculator'

describe('calculateSalesTax', () => {
  it('should calculate Texas tax correctly', () => {
    const result = calculateSalesTax('77373', 100)
    expect(result.state).toBe('TX')
    expect(result.rate).toBe(0.0825)
    expect(result.taxAmount).toBe(8.25)
  })

  it('should calculate California tax correctly', () => {
    const result = calculateSalesTax('90210', 200)
    expect(result.state).toBe('CA')
    expect(result.rate).toBe(0.0825)
    expect(result.taxAmount).toBe(16.50)
  })

  it('should return 0 for no-tax states (Oregon)', () => {
    const result = calculateSalesTax('97201', 500)
    expect(result.state).toBe('OR')
    expect(result.rate).toBe(0)
    expect(result.taxAmount).toBe(0)
  })

  it('should return 0 for no-tax states (Delaware)', () => {
    const result = calculateSalesTax('19901', 1000)
    expect(result.state).toBe('DE')
    expect(result.taxAmount).toBe(0)
  })

  it('should return 0 for no-tax states (Montana)', () => {
    const result = calculateSalesTax('59001', 100)
    expect(result.state).toBe('MT')
    expect(result.taxAmount).toBe(0)
  })

  it('should handle zero subtotal', () => {
    const result = calculateSalesTax('77373', 0)
    expect(result.taxAmount).toBe(0)
    expect(result.state).toBe('TX')
  })

  it('should handle invalid zip code (too short)', () => {
    const result = calculateSalesTax('123', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('should handle empty zip code', () => {
    const result = calculateSalesTax('', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('should handle non-numeric zip code', () => {
    const result = calculateSalesTax('abcde', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('should handle unknown zip code', () => {
    const result = calculateSalesTax('00001', 100)
    expect(result.state).toBe('Unknown')
    expect(result.taxAmount).toBe(0)
  })

  it('should round to 2 decimal places', () => {
    const result = calculateSalesTax('77373', 99.99)
    expect(result.taxAmount).toBe(parseFloat((99.99 * 0.0825).toFixed(2)))
  })

  it('should calculate New York tax', () => {
    const result = calculateSalesTax('10001', 100)
    expect(result.state).toBe('NY')
    expect(result.rate).toBe(0.0840)
  })

  it('should calculate Florida tax', () => {
    const result = calculateSalesTax('33101', 100)
    expect(result.state).toBe('FL')
    expect(result.rate).toBe(0.0706)
  })
})

describe('getTaxRateInfo', () => {
  it('should return rate info for valid zip', () => {
    const info = getTaxRateInfo('77373')
    expect(info).not.toBeNull()
    expect(info!.state).toBe('TX')
    expect(info!.rate).toBe(0.0825)
  })

  it('should return null for unknown zip', () => {
    const info = getTaxRateInfo('00001')
    expect(info).toBeNull()
  })
})
