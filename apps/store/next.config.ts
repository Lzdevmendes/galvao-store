import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@galvao/ui'],
  // better-sqlite3 é nativo (Node.js only) — não bundlar
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default config
