'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',              label: 'Dashboard',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: '/pedidos',       label: 'Pedidos',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg> },
  { href: '/produtos',      label: 'Produtos',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg> },
  { href: '/estoque',       label: 'Estoque',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
  { href: '/cupons',        label: 'Cupons',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/><path d="m14 14 4 4"/></svg> },
  { href: '/clientes',      label: 'Clientes',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/relatorios',    label: 'Relatórios',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/configuracoes', label: 'Configurações',icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
]

interface AdminSidebarProps {
  userEmail?: string | null
  storeUrl?: string
}

export function AdminSidebar({ userEmail, storeUrl }: AdminSidebarProps) {
  const pathname      = usePathname()
  const [open, setOpen] = useState(false)

  // Fechar sidebar ao navegar (mobile)
  useEffect(() => { setOpen(false) }, [pathname])

  // Fechar com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const sidebarContent = (
    <>
      {/* Brand */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1E2530' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#F26B1F', letterSpacing: '.06em', lineHeight: 1 }}>
          GALVÃO&apos;S
        </div>
        <div style={{ fontSize: 10, color: '#4A5462', letterSpacing: '.15em', marginTop: 2 }}>
          ADMIN PANEL
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', fontSize: 13, fontWeight: 500,
                color: active ? '#F26B1F' : '#9CA3AF',
                background: active ? 'rgba(242,107,31,.1)' : 'transparent',
                transition: 'all .15s', minHeight: 44,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#F8F9FB' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid #1E2530' }}>
        <p style={{ fontSize: 11, color: '#4A5462', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {userEmail}
        </p>
        <a href={storeUrl ?? 'http://localhost:3010'} style={{ fontSize: 11, color: '#F26B1F' }}>
          ← Ver loja
        </a>
      </div>
    </>
  )

  return (
    <>
      {/* ── Hamburger button (mobile only) ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Abrir menu"
        aria-expanded={open}
        style={{
          display: 'none', // mostrado via CSS no mobile
          position: 'fixed', top: 12, left: 16, zIndex: 300,
          width: 40, height: 40, borderRadius: 8,
          background: '#0F1318', border: '1px solid #1E2530',
          color: '#F8F9FB', cursor: 'pointer',
          alignItems: 'center', justifyContent: 'center',
        }}
        className="admin-hamburger"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        )}
      </button>

      {/* ── Backdrop (mobile, quando open) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar desktop (always visible ≥769px) ── */}
      <aside
        className="admin-sidebar"
        data-open={open}
        style={{
          width: 220, flexShrink: 0, background: '#0F1318',
          borderRight: '1px solid #1E2530',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
