import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

export default async function ContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const name  = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Cliente'
  const email = user.email ?? ''

  const menuItems = [
    { href:'/conta/pedidos',   icon:'📦', label:'Meus pedidos',   desc:'Histórico e rastreio' },
    { href:'/conta/enderecos', icon:'📍', label:'Endereços',       desc:'Gerenciar endereços salvos' },
    { href:'/conta/favoritos', icon:'❤️',  label:'Favoritos',       desc:'Produtos que você curtiu' },
    { href:'/conta/cupons',    icon:'🏷️',  label:'Cupons',          desc:'Seus cupons de desconto' },
    { href:'/conta/dados',     icon:'✏️',  label:'Dados pessoais',  desc:'Editar perfil e senha' },
  ]

  return (
    <div className="container" style={{ paddingTop:48, paddingBottom:96 }}>
      {/* Cabeçalho */}
      <div style={{ background:'linear-gradient(135deg,#0B0E12,#1F252E)', borderRadius:16, padding:'40px 40px 32px', marginBottom:40, color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-5%', top:'-30%', width:'40%', height:'160%', background:'radial-gradient(ellipse,rgba(242,107,31,.2) 0%,transparent 65%)', pointerEvents:'none' }} />
        <div style={{ display:'flex', alignItems:'center', gap:20, position:'relative', zIndex:1 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--brand-orange)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-stencil)', fontSize:28, color:'#fff', flexShrink:0 }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-stencil)', fontSize:32, lineHeight:1, letterSpacing:'.04em' }}>
              OLÁ, {name.split(' ')[0].toUpperCase()}!
            </div>
            <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'rgba(255,255,255,.6)', marginTop:4 }}>{email}</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {menuItems.map(item => (
          <Link key={item.href} href={item.href} style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:14, padding:'24px', display:'flex', gap:16, alignItems:'flex-start', textDecoration:'none' }}>
            <span style={{ fontSize:28, flexShrink:0 }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:15, color:'var(--fg)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)' }}>{item.desc}</div>
            </div>
          </Link>
        ))}

        {/* Sair */}
        <LogoutButton />
      </div>
    </div>
  )
}
