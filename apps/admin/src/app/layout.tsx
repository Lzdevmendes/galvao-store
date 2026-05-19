import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from './nav'
import { ToastProvider } from '@/lib/toast'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch { /* página de login não precisa do user */ }

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Admin — Galvão&apos;s Store</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Space Grotesk', system-ui, sans-serif; background: #0B0E12; color: #F8F9FB; -webkit-font-smoothing: antialiased; }
          a { color: inherit; text-decoration: none; }
          button { font-family: inherit; cursor: pointer; }
          .admin-nav-link {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 20px; font-size: 14px; font-weight: 500;
            color: #9CA3AF; transition: all .15s;
          }
          .admin-nav-link:hover { color: #F8F9FB; background: rgba(242,107,31,.08); }
          ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #2A323D; border-radius: 99px; }
        `}</style>
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* ── Sidebar ── */}
          <aside style={{
            width: 220, flexShrink: 0, background: '#0F1318',
            borderRight: '1px solid #1E2530',
            display: 'flex', flexDirection: 'column',
            position: 'sticky', top: 0, height: '100vh', overflow: 'auto',
          }}>
            {/* Brand */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1E2530' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#F26B1F', letterSpacing: '.06em', lineHeight: 1 }}>
                GALVÃO&apos;S
              </div>
              <div style={{ fontSize: 10, color: '#4A5462', letterSpacing: '.15em', marginTop: 2 }}>
                ADMIN PANEL
              </div>
            </div>

            {/* Nav */}
            <AdminNav />

            {/* User */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #1E2530' }}>
              <p style={{ fontSize: 11, color: '#4A5462', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
              <a href={process.env.STORE_URL ?? 'http://localhost:3010'} style={{ fontSize: 11, color: '#F26B1F' }}>
                ← Ver loja
              </a>
            </div>
          </aside>

          {/* ── Content ── */}
          <main style={{ flex: 1, padding: '32px', overflow: 'auto', minWidth: 0 }}>
            <ToastProvider>{children}</ToastProvider>
          </main>
        </div>
      </body>
    </html>
  )
}
