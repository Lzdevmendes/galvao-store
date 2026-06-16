import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin-sidebar'
import { ToastProvider } from '@/lib/toast'
import { NavProgress } from '@/components/nav-progress'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch { /* página de login não precisa do user */ }

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Admin — Galvão&apos;s Store</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { -webkit-tap-highlight-color: transparent; }
          body {
            font-family: 'Space Grotesk', system-ui, sans-serif;
            background-color: #0B0E12; color: #F8F9FB;
            /* Glows ambiente da marca — base para o dark glass refratar */
            background-image:
              radial-gradient(52vw 42vh at 0% -6%,   rgba(242,107,31,.12), transparent 56%),
              radial-gradient(46vw 46vh at 100% 0%,  rgba(31,181,168,.09), transparent 56%);
            background-attachment: fixed;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
          }
          a { color: inherit; text-decoration: none; }
          button, a, [role="button"] { touch-action: manipulation; }

          /* ── Layout principal ── */
          .admin-layout { display: flex; min-height: 100dvh; }
          .admin-main   { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow-x: hidden; }
          .admin-content { padding: 32px; flex: 1; }

          /* ── Topbar ── */
          .admin-topbar {
            background: rgba(15,19,24,.62);
            -webkit-backdrop-filter: saturate(160%) blur(20px);
            backdrop-filter: saturate(160%) blur(20px);
            border-bottom: 1px solid rgba(255,255,255,.08);
            box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
            padding: 14px 32px; display: flex; align-items: center; gap: 16px;
            position: sticky; top: 0; z-index: 100;
          }
          .admin-topbar .crumb { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #4A5462; letter-spacing: .14em; text-transform: uppercase; }
          .admin-topbar .search { flex: 1; max-width: 480px; position: relative; }
          .admin-topbar .search input { width: 100%; padding: 8px 12px 8px 36px; border: 1px solid #1E2530; border-radius: 8px; font-size: 13px; background: #141922; color: #F8F9FB; font-family: inherit; outline: none; }
          .admin-topbar .search input:focus { border-color: #F26B1F; }
          .admin-topbar .search svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #4A5462; }
          .admin-topbar .t-actions { display: flex; gap: 8px; align-items: center; margin-left: auto; }

          /* ── Sidebar ── */
          .admin-sidebar a, .admin-sidebar button { min-height: 44px; }

          /* ── Scrollbars ── */
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-thumb { background: #2A323D; border-radius: 99px; }

          /* ── Cards / UI ── */
          .stat-card--link:hover { transform: translateY(-2px); border-color: #F26B1F44 !important; transition: all .2s; }

          /* ════════════════════════════════
             MOBILE OVERRIDES ≤ 768px
             ════════════════════════════════ */
          @media (max-width: 768px) {
            /* Sidebar: oculto por padrão, drawer ao abrir */
            .admin-sidebar {
              position: fixed !important;
              top: 0 !important; left: 0 !important; bottom: 0 !important;
              height: 100dvh !important;
              z-index: 250;
              transform: translateX(-100%);
              transition: transform .25s cubic-bezier(.4,0,.2,1);
              box-shadow: 4px 0 24px rgba(0,0,0,.5);
            }
            .admin-sidebar[data-open="true"] {
              transform: translateX(0);
            }

            /* Hamburger: visível no mobile */
            .admin-hamburger { display: flex !important; }

            /* Main: ocupa toda a largura */
            .admin-layout { flex-direction: column; }
            .admin-main { width: 100%; }

            /* Topbar: padding menor + espaço para hamburger */
            .admin-topbar {
              padding: 10px 16px 10px 64px;
              gap: 10px;
            }
            .admin-topbar .search { display: none; }
            .admin-topbar .crumb { font-size: 10px; }

            /* Content: padding menor */
            .admin-content { padding: 16px 14px 80px; }

            /* Page heads */
            .page-head { flex-direction: column; align-items: flex-start !important; gap: 12px; }
            .page-head h1 { font-size: 22px !important; }
            .page-head .right { flex-wrap: wrap; gap: 6px; }

            /* KPI row: 2 colunas */
            .kpi-row { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }

            /* Cards */
            .card { padding: 14px !important; }

            /* Tabs: scroll horizontal */
            .tabs { overflow-x: auto; scrollbar-width: none; }
            .tabs::-webkit-scrollbar { display: none; }
            .tabs button { flex-shrink: 0; white-space: nowrap; }

            /* Tables → ocultar, mostrar cards */
            table.adm { display: none; }
            .mobile-cards { display: flex !important; }

            /* Grids de 2 colunas (charts/bottom row) → 1 coluna */
            .admin-2col-grid { grid-template-columns: 1fr !important; }

            /* Cupons: 3-col → 1-col */
            .cupons-grid { grid-template-columns: 1fr !important; }

            /* Grids de formulário → 1 coluna */
            .field-row { grid-template-columns: 1fr !important; }
            .field-row.three { grid-template-columns: 1fr !important; }

            /* Image grid: 2 colunas */
            .img-grid { grid-template-columns: repeat(2, 1fr) !important; }

            /* Variant table: scroll horizontal */
            .var-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

            /* Filters: scroll horizontal */
            .filters { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; padding: 10px; scrollbar-width: none; }
            .filters::-webkit-scrollbar { display: none; }
            .filters .search-mini { min-width: 180px; }

            /* Settings layout */
            .settings { grid-template-columns: 1fr !important; }
          }

          @media (min-width: 769px) {
            .admin-hamburger { display: none !important; }
            .mobile-cards { display: none !important; }
          }
        `}</style>
      </head>
      <body>
        <NavProgress />
        <div className="admin-layout">
          <AdminSidebar
            userEmail={user?.email}
            storeUrl={process.env.STORE_URL}
          />
          <div className="admin-main">
            <div className="admin-content">
              <ToastProvider>{children}</ToastProvider>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
