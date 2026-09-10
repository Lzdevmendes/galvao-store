import { NextRequest, NextResponse } from 'next/server'
import { runAllActiveSources } from '@/lib/import/run-import'

// Importação automática de produtos dos sites de importadores ativos.
// Protegido por CRON_SECRET (Vercel Cron), mesmo padrão dos crons do store
// (apps/store/src/app/api/cron/*). Agendado em apps/admin/vercel.json.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const summaries = await runAllActiveSources()

  return NextResponse.json({ ok: true, sources: summaries })
}
