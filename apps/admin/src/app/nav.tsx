'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',              icon: '📊', label: 'Dashboard'     },
  { href: '/pedidos',       icon: '🛒', label: 'Pedidos'       },
  { href: '/produtos',      icon: '👟', label: 'Produtos'      },
  { href: '/estoque',       icon: '📦', label: 'Estoque'       },
  { href: '/cupons',        icon: '🏷️', label: 'Cupons'        },
  { href: '/clientes',      icon: '👥', label: 'Clientes'      },
  { href: '/relatorios',    icon: '📈', label: 'Relatórios'    },
  { href: '/configuracoes', icon: '⚙️', label: 'Configurações' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav style={{ padding: '12px 0', flex: 1 }}>
      {NAV.map(item => {
        const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="admin-nav-link"
            style={active ? { color: '#F26B1F', background: 'rgba(242,107,31,.1)' } : undefined}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
