import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size    = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  const logoPath = join(process.cwd(), 'public', 'logo.svg')
  const svg      = readFileSync(logoPath)
  const base64   = `data:image/svg+xml;base64,${svg.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={base64} width={64} height={64} alt="" />
      </div>
    ),
    { ...size }
  )
}
