import { put, list } from '@vercel/blob'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

function getLocalPath(filename: string): string {
  return process.env.VERCEL
    ? join('/tmp', filename)
    : join(process.cwd(), 'data', filename)
}

export async function blobGet<T>(blobPath: string, localFilename: string, defaults: T): Promise<T> {
  try {
    // Production: Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: blobPath.split('/').slice(0, -1).join('/') + '/' })
      const blob = blobs.find((b) => b.pathname === blobPath)

      if (blob?.url) {
        const response = await fetch(blob.url)
        const data = await response.json()
        return data as T
      }
      return defaults
    }

    // Local: read from file
    const localPath = getLocalPath(localFilename)
    if (existsSync(localPath)) {
      const content = await readFile(localPath, 'utf-8')
      return JSON.parse(content) as T
    }

    return defaults
  } catch (error) {
    console.error(`Error reading from ${blobPath}:`, error)
    return defaults
  }
}

export async function blobPut(blobPath: string, localFilename: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2)

  // Production: Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await put(blobPath, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    return
  }

  // Local: write to file
  const localPath = getLocalPath(localFilename)
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
  await writeFile(localPath, json, 'utf-8')
}
