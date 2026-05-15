import type { Metadata } from 'next'
import '@galvao/ui/globals.css'
import './globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: {
    default: "Galvão's Store — Chuteiras de Alta Performance",
    template: "%s — Galvão's Store",
  },
  description: 'Nike, Adidas, Puma, Umbro e mais. Frete grátis acima de R$ 399. 12x sem juros. 5% OFF no Pix.',
  keywords: ['chuteiras', 'nike', 'adidas', 'puma', 'campo', 'society', 'futsal'],
  openGraph: {
    type: 'website',
    siteName: "Galvão's Store",
    title: "Galvão's Store — Chuteiras de Alta Performance",
    description: 'Nike, Adidas, Puma, Umbro e mais.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
