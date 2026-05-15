import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PromoBar } from './components/layout/PromoBar';
import { Header } from './components/layout/Header';
import { BrandNav } from './components/layout/BrandNav';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { ProductListPage } from './pages/ProductListPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { useStore } from './store';

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBar />
      <Header />
      <BrandNav />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBar />
      <Header />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function App() {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin — layout próprio sem navbar de loja */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />

        {/* Login / Registo — sem BrandNav */}
        <Route path="/login" element={<LoginLayout><LoginPage /></LoginLayout>} />
        <Route path="/registro" element={<LoginLayout><LoginPage /></LoginLayout>} />

        {/* Checkout — sem BrandNav, sem Footer */}
        <Route path="/checkout" element={
          <div className="min-h-screen flex flex-col">
            <PromoBar />
            <Header />
            <div className="flex-1"><CheckoutPage /></div>
          </div>
        } />

        {/* Páginas da loja com layout completo */}
        <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
        <Route path="/produto/:slug" element={<StoreLayout><ProductPage /></StoreLayout>} />
        <Route path="/produtos" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/marca/:brand" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/categoria/:category" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/busca" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/lancamentos" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/mais-vendidas" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/ofertas" element={<StoreLayout><ProductListPage /></StoreLayout>} />
        <Route path="/favoritos" element={<StoreLayout><AccountPage /></StoreLayout>} />
        <Route path="/carrinho" element={<StoreLayout><CartPage /></StoreLayout>} />
        <Route path="/conta" element={<StoreLayout><AccountPage /></StoreLayout>} />
        <Route path="/conta/*" element={<StoreLayout><AccountPage /></StoreLayout>} />

        {/* 404 */}
        <Route path="*" element={
          <StoreLayout>
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <div className="font-display text-8xl text-brand-orange mb-4">404</div>
              <p className="text-(--fg-muted) mb-6">Página não encontrada.</p>
              <a href="/" className="text-brand-orange font-semibold hover:underline">Voltar à home →</a>
            </div>
          </StoreLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
