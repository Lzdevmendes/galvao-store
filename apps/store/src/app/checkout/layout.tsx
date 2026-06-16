import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Checkout exige autenticação — convidado é enviado para login/cadastro e volta ao checkout
export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/checkout')

  return <>{children}</>
}
