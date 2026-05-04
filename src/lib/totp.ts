import { generateSecret, generateURI, verifySync } from 'otplib'
import qrcode from 'qrcode'

const ISSUER = 'Hybrid Tech Auto'
// Allow ±1 time step (~30s) of clock drift between server and authenticator app.
const EPOCH_TOLERANCE = 1

export function generateTotpSecret(): string {
  return generateSecret()
}

export function buildOtpauthUrl(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret })
}

export async function buildOtpauthQrDataUrl(otpauthUrl: string): Promise<string> {
  return qrcode.toDataURL(otpauthUrl, { errorCorrectionLevel: 'M', margin: 1, width: 240 })
}

export function verifyTotpCode(secret: string, code: string): boolean {
  try {
    const result = verifySync({
      secret,
      token: code.replace(/\s+/g, ''),
      epochTolerance: EPOCH_TOLERANCE,
    })
    return result.valid
  } catch {
    return false
  }
}
