import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const NAV = [
  { href: '/admin',          icon: '📊', label: 'Dashboard'  },
  { href: '/admin/pedidos',  icon: '📦', label: 'Pedidos'    },
  { href: '/admin/produtos', icon: '👟', label: 'Produtos'   },
  { href: '/admin/cupons',   icon: '🏷️', label: 'Cupons'     },
  { href: '/admin/clientes', icon: '👥', label: 'Clientes'   },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0B0E12', color: '#F8F9FB', fontFamily: 'Space Grotesk, sans-serif' }}>

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
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', fontSize: 14, fontWeight: 500,
                color: '#9CA3AF', transition: 'color .15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F8F9FB')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1E2530' }}>
          <p style={{ fontSize: 11, color: '#4A5462', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          <Link href="/" style={{ fontSize: 11, color: '#F26B1F', textDecoration: 'none' }}>
            ← Ver loja
          </Link>
        </div>
      </aside>

      {/* ── Content ── */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
