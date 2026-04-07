export const WHATSAPP_NUMBER = '18327625299'

export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function getWhatsAppBatteryMessage(vehicle: string, price: number, locale: string = 'en'): string {
  if (locale === 'es') {
    return `Hola, me interesa la batería híbrida para ${vehicle} ($${price}). ¿Me pueden dar más información?`
  }
  return `Hi, I'm interested in the hybrid battery for ${vehicle} ($${price}). Can I get a quote?`
}

export function getWhatsAppGeneralMessage(locale: string = 'en'): string {
  if (locale === 'es') {
    return 'Hola, me interesa sus servicios de baterías híbridas. ¿Me pueden ayudar?'
  }
  return "Hi, I'm interested in your hybrid battery services. Can you help me?"
}
