import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="font-display text-3xl text-brand-orange tracking-wider">GALVÃO'S</div>
            <p className="text-sm text-ink-500 leading-relaxed">
              Chuteiras de alta performance para quem leva o jogo a sério. Nike, Adidas, Puma, Umbro e muito mais.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all text-sm font-bold">IG</a>
              <a href="#" className="w-9 h-9 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all text-sm font-bold">YT</a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold font-ui text-ink-300 uppercase tracking-widest mb-4">Catálogo</h4>
            <ul className="space-y-2.5">
              {['Chuteiras Campo', 'Chuteiras Society', 'Chuteiras Futsal', 'Tênis de Corrida', 'Camisas Oficiais', 'Meias e Acessórios'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-brand-orange transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold font-ui text-ink-300 uppercase tracking-widest mb-4">Marcas</h4>
            <ul className="space-y-2.5">
              {['Nike', 'Adidas', 'Puma', 'Umbro', 'New Balance', 'Mizuno', 'Joma'].map(brand => (
                <li key={brand}>
                  <Link to={`/marca/${brand.toLowerCase()}`} className="text-sm hover:text-brand-orange transition-colors">{brand}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold font-ui text-ink-300 uppercase tracking-widest mb-4">Atendimento</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={14} className="mt-0.5 shrink-0 text-brand-orange" />
                São Paulo, SP — Loja física e online
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={14} className="shrink-0 text-brand-orange" />
                (11) 99999-0000
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={14} className="shrink-0 text-brand-orange" />
                contato@galvaostore.com.br
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-ink-800 space-y-1.5">
              {['Trocas e Devoluções', 'Rastreio de Pedido', 'Política de Privacidade'].map(item => (
                <a key={item} href="#" className="block text-xs hover:text-brand-orange transition-colors">{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-600">
          <p>© 2026 Galvão's Store. Todos os direitos reservados.</p>
          <p>CNPJ 00.000.000/0001-00 · Loja parceira oficial</p>
        </div>
      </div>
    </footer>
  );
}
