import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './shared/store'
import { PromoBar } from './shared/layout/PromoBar'
import { SiteHeader } from './shared/layout/SiteHeader'
import { BrandNav } from './shared/layout/BrandNav'
import { SiteFooter } from './shared/layout/SiteFooter'
import { HomePage } from './features/home/HomePage'
import { ListingPage } from './features/listing/ListingPage'
import { ProductPage } from './features/pdp/ProductPage'
import { CartPage } from './features/cart/CartPage'
import { CheckoutPage } from './features/checkout/CheckoutPage'
import { LoginPage } from './features/auth/LoginPage'
import { AccountPage } from './features/account/AccountPage'
import { AdminPage } from './features/admin/AdminPage'

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PromoBar />
      <SiteHeader />
      <BrandNav />
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  )
}

function MinimalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <PromoBar />
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  const { theme } = useStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin — layout próprio */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />

        {/* Auth — sem footer */}
        <Route path="/login" element={<MinimalLayout><LoginPage /></MinimalLayout>} />
        <Route path="/registro" element={<MinimalLayout><LoginPage /></MinimalLayout>} />

        {/* Checkout — sem BrandNav */}
        <Route path="/checkout" element={<MinimalLayout><CheckoutPage /></MinimalLayout>} />

        {/* Loja completa */}
        <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
        <Route path="/produtos" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/marca/:brand" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/categoria/:category" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/busca" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/lancamentos" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/mais-vendidas" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/ofertas" element={<StoreLayout><ListingPage /></StoreLayout>} />
        <Route path="/produto/:slug" element={<StoreLayout><ProductPage /></StoreLayout>} />
        <Route path="/carrinho" element={<StoreLayout><CartPage /></StoreLayout>} />
        <Route path="/conta" element={<StoreLayout><AccountPage /></StoreLayout>} />
        <Route path="/favoritos" element={<StoreLayout><AccountPage /></StoreLayout>} />

        {/* 404 */}
        <Route path="*" element={
          <StoreLayout>
            <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontFamily: 'var(--font-stencil)', fontSize: 120, color: 'var(--brand-orange)', lineHeight: 1 }}>404</div>
              <p style={{ color: 'var(--fg-muted)', margin: '16px 0 32px' }}>Página não encontrada.</p>
              <a href="/" className="btn btn-primary">← Voltar à home</a>
            </div>
          </StoreLayout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
