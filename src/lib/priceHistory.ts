import { blobGet, blobPut } from '@/lib/storage'

export interface PriceRecord {
  batteryId: string
  price: number
  date: string
}

const BLOB_PATH = 'config/price-history.json'
const LOCAL_FILE = 'price-history.json'

export async function getPriceHistory(): Promise<PriceRecord[]> {
  return blobGet<PriceRecord[]>(BLOB_PATH, LOCAL_FILE, [])
}

export async function recordPrice(batteryId: string, price: number): Promise<void> {
  const history = await getPriceHistory()
  const today = new Date().toISOString().split('T')[0]

  // Only record if price changed from last recorded price for this battery
  const lastRecord = history
    .filter(r => r.batteryId === batteryId)
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  if (lastRecord && lastRecord.price === price) {
    return // No change
  }

  history.push({ batteryId, price, date: today })
  await blobPut(BLOB_PATH, LOCAL_FILE, history)
}

export async function getPreviousPrice(batteryId: string, currentPrice: number): Promise<number | null> {
  const history = await getPriceHistory()
  const records = history
    .filter(r => r.batteryId === batteryId)
    .sort((a, b) => b.date.localeCompare(a.date))

  // Find a previous price that differs from current
  for (const record of records) {
    if (record.price !== currentPrice) {
      return record.price
    }
  }
  return null
}

export async function recordAllPrices(batteries: { id: string; price: number }[]): Promise<void> {
  for (const battery of batteries) {
    await recordPrice(battery.id, battery.price)
  }
}
