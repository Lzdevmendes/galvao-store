import type { Metadata } from 'next'
import './globals.css'
import { PromoBar }    from '@/components/layout/promo-bar'
import { SiteHeader }  from '@/components/layout/site-header'
import { BrandNav }    from '@/components/layout/brand-nav'
import { SiteFooter }  from '@/components/layout/site-footer'
import { MobileTabBar } from '@/components/layout/mobile-tab-bar'

export const metadata: Metadata = {
  title: {
    default: "Galvão's Store — Chuteiras de Alta Performance",
    template: "%s — Galvão's Store",
  },
  description: 'Nike, Adidas, Puma, Umbro e mais. Frete grátis acima de R$ 399. 12x sem juros. 5% OFF no Pix.',
  keywords: ['chuteiras', 'nike', 'adidas', 'puma', 'campo', 'society', 'futsal', 'tênis'],
  openGraph: {
    type: 'website',
    siteName: "Galvão's Store",
    title: "Galvão's Store — Chuteiras de Alta Performance",
    description: 'Nike, Adidas, Puma, Umbro. Frete grátis acima de R$ 399.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <PromoBar />
        <SiteHeader />
        <BrandNav />
        <main>{children}</main>
        <SiteFooter />
        <MobileTabBar />
      </body>
    </html>
  )
}
