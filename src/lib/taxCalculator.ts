/**
 * Sales Tax Calculator for US Zip Codes
 * Based on average sales tax rates by state
 */

interface TaxRate {
  state: string
  minZip: number
  maxZip: number
  rate: number
}

const TAX_RATES: TaxRate[] = [
  // Alabama
  { state: 'AL', minZip: 35000, maxZip: 36999, rate: 0.0940 },
  
  // Alaska (varies by city)
  { state: 'AK', minZip: 99500, maxZip: 99999, rate: 0.0174 },
  
  // Arizona
  { state: 'AZ', minZip: 85000, maxZip: 86999, rate: 0.0840 },
  
  // Arkansas
  { state: 'AR', minZip: 71600, maxZip: 72999, rate: 0.0947 },
  
  // California
  { state: 'CA', minZip: 90000, maxZip: 96999, rate: 0.0825 },
  
  // Colorado
  { state: 'CO', minZip: 80000, maxZip: 81999, rate: 0.0763 },
  
  // Connecticut
  { state: 'CT', minZip: 6000, maxZip: 6999, rate: 0.0635 },
  
  // Delaware (no sales tax)
  { state: 'DE', minZip: 19700, maxZip: 19999, rate: 0.0000 },
  
  // Florida
  { state: 'FL', minZip: 32000, maxZip: 34999, rate: 0.0706 },
  
  // Georgia
  { state: 'GA', minZip: 30000, maxZip: 31999, rate: 0.0729 },
  
  // Hawaii
  { state: 'HI', minZip: 96700, maxZip: 96999, rate: 0.0442 },
  
  // Idaho
  { state: 'ID', minZip: 83200, maxZip: 83999, rate: 0.0600 },
  
  // Illinois
  { state: 'IL', minZip: 60000, maxZip: 62999, rate: 0.0866 },
  
  // Indiana
  { state: 'IN', minZip: 46000, maxZip: 47999, rate: 0.0700 },
  
  // Iowa
  { state: 'IA', minZip: 50000, maxZip: 52999, rate: 0.0686 },
  
  // Kansas
  { state: 'KS', minZip: 66000, maxZip: 67999, rate: 0.0825 },
  
  // Kentucky
  { state: 'KY', minZip: 40000, maxZip: 42999, rate: 0.0600 },
  
  // Louisiana
  { state: 'LA', minZip: 70000, maxZip: 71999, rate: 0.0945 },
  
  // Maine
  { state: 'ME', minZip: 3900, maxZip: 4999, rate: 0.0550 },
  
  // Maryland
  { state: 'MD', minZip: 20600, maxZip: 21999, rate: 0.0600 },
  
  // Massachusetts
  { state: 'MA', minZip: 1000, maxZip: 2799, rate: 0.0625 },
  
  // Michigan
  { state: 'MI', minZip: 48000, maxZip: 49999, rate: 0.0600 },
  
  // Minnesota
  { state: 'MN', minZip: 55000, maxZip: 56999, rate: 0.0743 },
  
  // Mississippi
  { state: 'MS', minZip: 38600, maxZip: 39999, rate: 0.0707 },
  
  // Missouri
  { state: 'MO', minZip: 63000, maxZip: 65999, rate: 0.0802 },
  
  // Montana (no sales tax)
  { state: 'MT', minZip: 59000, maxZip: 59999, rate: 0.0000 },
  
  // Nebraska
  { state: 'NE', minZip: 68000, maxZip: 69999, rate: 0.0689 },
  
  // Nevada
  { state: 'NV', minZip: 89000, maxZip: 89999, rate: 0.0819 },
  
  // New Hampshire (no sales tax)
  { state: 'NH', minZip: 3000, maxZip: 3899, rate: 0.0000 },
  
  // New Jersey
  { state: 'NJ', minZip: 7000, maxZip: 8999, rate: 0.0666 },
  
  // New Mexico
  { state: 'NM', minZip: 87000, maxZip: 88999, rate: 0.0779 },
  
  // New York
  { state: 'NY', minZip: 10000, maxZip: 14999, rate: 0.0840 },
  
  // North Carolina
  { state: 'NC', minZip: 27000, maxZip: 28999, rate: 0.0698 },
  
  // North Dakota
  { state: 'ND', minZip: 58000, maxZip: 58999, rate: 0.0686 },
  
  // Ohio
  { state: 'OH', minZip: 43000, maxZip: 45999, rate: 0.0772 },
  
  // Oklahoma
  { state: 'OK', minZip: 73000, maxZip: 74999, rate: 0.0892 },
  
  // Oregon (no sales tax)
  { state: 'OR', minZip: 97000, maxZip: 97999, rate: 0.0000 },
  
  // Pennsylvania
  { state: 'PA', minZip: 15000, maxZip: 19999, rate: 0.0600 },
  
  // Rhode Island
  { state: 'RI', minZip: 2800, maxZip: 2999, rate: 0.0700 },
  
  // South Carolina
  { state: 'SC', minZip: 29000, maxZip: 29999, rate: 0.0728 },
  
  // South Dakota
  { state: 'SD', minZip: 57000, maxZip: 57999, rate: 0.0648 },
  
  // Tennessee
  { state: 'TN', minZip: 37000, maxZip: 38999, rate: 0.0947 },
  
  // Texas
  { state: 'TX', minZip: 73300, maxZip: 73399, rate: 0.0825 },
  { state: 'TX', minZip: 75000, maxZip: 79999, rate: 0.0825 },
  { state: 'TX', minZip: 88500, maxZip: 88599, rate: 0.0825 },
  
  // Utah
  { state: 'UT', minZip: 84000, maxZip: 84999, rate: 0.0703 },
  
  // Vermont
  { state: 'VT', minZip: 5000, maxZip: 5999, rate: 0.0631 },
  
  // Virginia
  { state: 'VA', minZip: 20100, maxZip: 20599, rate: 0.0565 },
  { state: 'VA', minZip: 22000, maxZip: 24699, rate: 0.0565 },
  
  // Washington
  { state: 'WA', minZip: 98000, maxZip: 99599, rate: 0.0960 },
  
  // West Virginia
  { state: 'WV', minZip: 24700, maxZip: 26999, rate: 0.0625 },
  
  // Wisconsin
  { state: 'WI', minZip: 53000, maxZip: 54999, rate: 0.0535 },
  
  // Wyoming
  { state: 'WY', minZip: 82000, maxZip: 83999, rate: 0.0562 },
  
  // DC
  { state: 'DC', minZip: 20000, maxZip: 20999, rate: 0.0600 },
]

/**
 * Calculate sales tax based on zip code
 * @param zipCode - 5-digit US zip code
 * @param subtotal - Subtotal amount to calculate tax on
 * @returns Object with tax amount, rate, and state
 */
export function calculateSalesTax(zipCode: string, subtotal: number): {
  taxAmount: number
  rate: number
  state: string
} {
  if (!zipCode || zipCode.length !== 5) {
    return { taxAmount: 0, rate: 0, state: 'Unknown' }
  }
  
  const zip = parseInt(zipCode)
  
  if (isNaN(zip)) {
    return { taxAmount: 0, rate: 0, state: 'Unknown' }
  }
  
  // Find matching tax rate
  const taxRate = TAX_RATES.find(rate => zip >= rate.minZip && zip <= rate.maxZip)
  
  if (!taxRate) {
    return { taxAmount: 0, rate: 0, state: 'Unknown' }
  }
  
  const taxAmount = subtotal * taxRate.rate
  
  return {
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    rate: taxRate.rate,
    state: taxRate.state
  }
}

/**
 * Get tax rate information for a zip code
 * @param zipCode - 5-digit US zip code
 * @returns Tax rate object or null if not found
 */
export function getTaxRateInfo(zipCode: string): {
  rate: number
  state: string
} | null {
  const { rate, state } = calculateSalesTax(zipCode, 1)
  
  if (state === 'Unknown') {
    return null
  }
  
  return { rate, state }
}

