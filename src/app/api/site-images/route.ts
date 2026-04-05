import { NextRequest, NextResponse } from 'next/server'
import { blobGet, blobPut } from '@/lib/storage'
import { siteImages as defaultSiteImages, type SiteImages } from '@/data/images'

const BLOB_PATH = 'config/site-images.json'
const LOCAL_FILE = 'site-images-custom.json'

export async function GET() {
  try {
    const siteImages = await blobGet<SiteImages>(BLOB_PATH, LOCAL_FILE, defaultSiteImages)
    return NextResponse.json({ success: true, siteImages })
  } catch (error) {
    console.error('Error loading site images:', error)
    return NextResponse.json({ success: true, siteImages: defaultSiteImages })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const siteImages = body.siteImages ?? body

    if (!siteImages || typeof siteImages !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    await blobPut(BLOB_PATH, LOCAL_FILE, siteImages)

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente',
    })
  } catch (error) {
    console.error('Error saving site images:', error)
    return NextResponse.json(
      { success: false, error: 'Error al guardar la configuración' },
      { status: 500 }
    )
  }
}
