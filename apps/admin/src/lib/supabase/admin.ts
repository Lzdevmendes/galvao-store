import { createClient } from '@supabase/supabase-js'

// Service role — bypass RLS para operações de storage no admin
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
