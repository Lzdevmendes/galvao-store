import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { LogoutButton } from './logout-button'

export default async function ContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const name  = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Cliente'
  const email = user.email ?? ''

  const [[orderStats], [{ favoritos: favoritosCount }], [{ cupons: cuponsCount }]] = await Promise.all([
    db.all<{ pedidos: number; em_rota: number }>(sql`
      SELECT COUNT(*) AS pedidos, SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) AS em_rota
      FROM orders WHERE user_id = ${user.id} OR customer_email = ${email}
    `),
    db.all<{ favoritos: number }>(sql`
      SELECT COUNT(*) AS favoritos FROM wishlists WHERE user_id = ${user.id}
    `),
    db.all<{ cupons: number }>(sql`
      SELECT COUNT(*) AS cupons FROM coupons
      WHERE active = 1 AND (expires_at IS NULL OR expires_at > datetime('now'))
        AND (max_uses IS NULL OR used_count < max_uses)
    `),
  ])

  const menuItems = [
    { href:'/conta/pedidos',   icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>, label:'Meus pedidos',   desc:'Histórico e rastreio' },
    { href:'/conta/enderecos', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>, label:'Endereços', desc:'Gerenciar endereços salvos' },
    { href:'/conta/favoritos', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/></svg>, label:'Favoritos', desc:'Produtos que você curtiu' },
    { href:'/conta/cupons',    icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>, label:'Cupons', desc:'Seus cupons de desconto' },
    { href:'/conta/dados',     icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="m16 11 2 2 4-4" strokeWidth="1.5"/></svg>, label:'Dados pessoais', desc:'Editar perfil e senha' },
    { href:'/conta/privacidade', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>, label:'Privacidade', desc:'Consentimento, exportar e apagar dados' },
  ]

  const firstName = name.split(' ')[0]

  return (
    <div style={{ paddingBottom:80 }}>
      {/* ── Header Mobile — dark gradient + avatar + KPIs ── */}
      <div className="acc-mobile-head" style={{
        background:'linear-gradient(135deg,#0B0E12,#1F252E)',
        color:'#fff', padding:'24px 16px 20px',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', right:'-20%', top:'-40%', width:'70%', height:'180%', background:'radial-gradient(ellipse,rgba(242,107,31,.25),transparent 60%)', pointerEvents:'none' }} />
        {/* Avatar + nome */}
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16, position:'relative', zIndex:1 }}>
          <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--brand-orange)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:20, color:'#fff', flexShrink:0 }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-stencil)', fontSize:28, lineHeight:.95 }}>
              E aí, <span style={{ color:'var(--brand-orange)' }}>{firstName}.</span>
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'rgba(255,255,255,.5)', marginTop:2 }}>{email}</div>
          </div>
        </div>
        {/* KPI grid — 4 colunas (responsivo via .acc-kpi-row no globals.css) */}
        <div className="acc-kpi-row" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, position:'relative', zIndex:1 }}>
          {[
            { v: String(orderStats?.pedidos ?? 0), l:'Pedidos' },
            { v: String(orderStats?.em_rota ?? 0), l:'Em rota', color:'var(--brand-orange)' },
            { v: String(favoritosCount ?? 0), l:'Favoritos' },
            { v: String(cuponsCount ?? 0), l:'Cupons' },
          ].map(({ v, l, color }) => (
            <div key={l} style={{ background:'rgba(255,255,255,.07)', borderRadius:8, padding:'8px 6px', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:20, color: color ?? '#fff' }}>{v}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'rgba(255,255,255,.4)', letterSpacing:'.08em', textTransform:'uppercase', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Header Desktop — card com gradiente ── */}
      <div className="acc-desktop-head container" style={{ paddingTop:48 }}>
        <div style={{ background:'linear-gradient(135deg,#0B0E12,#1F252E)', borderRadius:16, padding:'40px 40px 32px', marginBottom:40, color:'#fff', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:'-5%', top:'-30%', width:'40%', height:'160%', background:'radial-gradient(ellipse,rgba(242,107,31,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:20, position:'relative', zIndex:1 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--brand-orange)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-stencil)', fontSize:28, color:'#fff', flexShrink:0 }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-stencil)', fontSize:32, lineHeight:1, letterSpacing:'.04em' }}>OLÁ, {firstName.toUpperCase()}!</div>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'rgba(255,255,255,.6)', marginTop:4 }}>{email}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu — responsivo via .acc-menu-grid/.acc-menu-item no globals.css */}
      <div className="container" style={{ paddingTop:0, paddingBottom:24 }}>
        <div className="acc-menu-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} className="acc-menu-item" style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:14, padding:'24px', display:'flex', gap:16, alignItems:'flex-start', textDecoration:'none' }}>
              <span style={{ color:'var(--brand-orange)', flexShrink:0, marginTop:2 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:15, color:'var(--fg)', marginBottom:4 }}>{item.label}</div>
                <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
