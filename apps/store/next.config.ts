import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// unsafe-eval é necessário para o SDK do Mercado Pago (MP usa eval internamente)
// unsafe-inline mantido em script-src por compatibilidade com GTM/Meta Pixel inline
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://connect.facebook.net https://sdk.mercadopago.com https://*.mercadopago.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://*.mercadopago.com",
  "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://*.upstash.io https://www.google-analytics.com https://region1.analytics.google.com https://www.clarity.ms wss://*.supabase.co https://o0.ingest.sentry.io",
  "frame-src 'self' https://*.mercadopago.com https://*.mercadolibre.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy',   value: CSP },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Permissões granulares — geo, câmera, etc. desativados
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://sdk.mercadopago.com"), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Impede que o browser adivinhe o tipo de conteúdo (MIME sniffing)
  { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
]

const config: NextConfig = {
  transpilePackages: ['@galvao/ui'],
  serverExternalPackages: ['@libsql/client'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(config, {
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent:  !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
