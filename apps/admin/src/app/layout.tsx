import type { Metadata } from 'next'
import '@galvao/ui/globals.css'
import './globals.css'

export const metadata: Metadata = {
  title: "Admin — Galvão's Store",
  robots: { index: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <head />
      <body>{children}</body>
    </html>
  )
}
