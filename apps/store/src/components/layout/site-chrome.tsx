'use client'

import { usePathname } from 'next/navigation'

// Esconde o chrome de loja (header, nav, footer, tabbar, carrinho, whatsapp) nas
// rotas de autenticação. Precisa ser um wrapper client-side com usePathname porque
// esses componentes são renderizados como irmãos de {children} no RootLayout — um
// auth/layout.tsx aninhado não conseguiria removê-los (só envolve o que está dentro
// dele, não o que o layout pai renderiza ao lado).
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/auth')) return null
  return <>{children}</>
}
