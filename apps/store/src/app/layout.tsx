import type { Metadata } from 'next'
import './globals.css'
import { PromoBar }    from '@/components/layout/promo-bar'
import { SiteHeader }  from '@/components/layout/site-header'
import { BrandNav }    from '@/components/layout/brand-nav'
import { SiteFooter }  from '@/components/layout/site-footer'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'
import { CartDrawer }  from '@/components/cart/cart-drawer'
import { TrackingScripts } from '@/components/analytics/tracking-scripts'
import { CookieBanner }      from '@/components/lgpd/cookie-banner'
import { WhatsAppButton }    from '@/components/whatsapp-button'

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://galvaosstore.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Galvão's Store — Chuteiras de Alta Performance",
    template: "%s — Galvão's Store",
  },
  description: 'Nike, Adidas, Puma, Umbro e mais. Frete grátis acima de R$ 399. 12x sem juros. 5% OFF no Pix.',
  keywords: ['chuteiras', 'futebol', 'nike', 'adidas', 'puma', 'umbro', 'campo', 'society', 'futsal', 'tênis esportivo'],
  authors: [{ name: "Galvão's Store" }],
  creator: "Galvão's Store",
  openGraph: {
    type:        'website',
    locale:      'pt_BR',
    siteName:    "Galvão's Store",
    url:         BASE,
    title:       "Galvão's Store — Chuteiras de Alta Performance",
    description: 'Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399. 12x sem juros.',
    images: [{ url: '/logo.svg', width: 150, height: 150, alt: "Galvão's Store" }],
  },
  twitter: {
    card:        'summary',
    title:       "Galvão's Store — Chuteiras de Alta Performance",
    description: 'Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: '' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        {/* JSON-LD — Organisation */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportingGoodsStore',
          name: "Galvão's Store",
          url: BASE,
          logo: `${BASE}/logo.svg`,
          description: 'Chuteiras e tênis esportivos das melhores marcas. Nike, Adidas, Puma, Umbro.',
          address: { '@type': 'PostalAddress', addressLocality: 'Caraguatatuba', addressRegion: 'SP', addressCountry: 'BR' },
          contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'Portuguese' },
          sameAs: [
            process.env.NEXT_PUBLIC_INSTAGRAM ?? '',
            process.env.NEXT_PUBLIC_FACEBOOK  ?? '',
          ].filter(Boolean),
        })}} />

        <PromoBar />
        <SiteHeader />
        <BrandNav />
        <main>{children}</main>
        <SiteFooter />
        <MobileTabBar />
        <CartDrawer />
        <TrackingScripts />
        <CookieBanner />
        <WhatsAppButton />
      </body>
    </html>
  )
}
