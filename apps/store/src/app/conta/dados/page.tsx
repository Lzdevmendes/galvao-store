import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureLocalUser, getLocalUser } from '@/lib/user-sync'
import ProfileForm from './profile-form'

export default async function DadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  ensureLocalUser(user)
  const local = await getLocalUser(user.id)

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 640 }}>
      <ProfileForm
        email={user.email ?? ''}
        initial={{
          name:     local?.name     ?? user.user_metadata?.full_name ?? '',
          phone:    local?.phone    ?? '',
          cpf:      local?.cpf      ?? '',
          birthday: local?.birthday ?? '',
        }}
      />
    </div>
  )
}
