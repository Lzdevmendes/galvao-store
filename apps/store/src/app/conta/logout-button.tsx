'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'

export function LogoutButton() {
  const router = useRouter()
  const clear  = useCartStore(s => s.clear)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clear()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{ background:'var(--bg-elev)', border:'1px solid var(--border)', borderRadius:14, padding:'24px', display:'flex', gap:16, alignItems:'flex-start', cursor:'pointer', textAlign:'left', transition:'all .15s', width:'100%' }}
      onMouseEnter={e => { (e.currentTarget).style.borderColor = '#E23B3B' }}
      onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)' }}
    >
      <span style={{ fontSize:28 }}>🚪</span>
      <div>
        <div style={{ fontFamily:'var(--font-ui)', fontWeight:700, fontSize:15, color:'#E23B3B', marginBottom:4 }}>Sair</div>
        <div style={{ fontFamily:'var(--font-ui)', fontSize:13, color:'var(--fg-muted)' }}>Encerrar sessão</div>
      </div>
    </button>
  )
}
