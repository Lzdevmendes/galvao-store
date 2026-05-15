import { CreditCard, Lock, Package, CheckCircle } from 'lucide-react';

const items = [
  { icon: CreditCard, title: '12x sem juros', sub: 'no cartão de crédito' },
  { icon: Lock, title: 'Compra 100% segura', sub: 'site protegido por SSL' },
  { icon: Package, title: 'Frete grátis Brasil', sub: 'acima de R$ 399' },
  { icon: CheckCircle, title: '5% OFF no Pix', sub: 'aprovação imediata' },
];

export function TrustBar() {
  return (
    <div className="border-y border-(--border) bg-(--bg-elev)">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-brand-orange/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-brand-orange" />
              </div>
              <div>
                <div className="text-xs font-bold font-ui text-(--fg)">{title}</div>
                <div className="text-[11px] text-(--fg-muted)">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
