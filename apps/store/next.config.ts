import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@galvao/ui', '@galvao/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default config
