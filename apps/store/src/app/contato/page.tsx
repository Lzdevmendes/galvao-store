import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Contato — Galvão\'s Store' }

export default function ContatoPage() {
  const PHONE = '5512999999999' // Substituir pelo número real

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 96, maxWidth: 700 }}>
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--brand-orange)', marginBottom: 8, fontWeight: 700 }}>
          Atendimento
        </div>
        <h1 style={{ fontFamily: 'var(--font-stencil)', fontSize: 'clamp(42px,7vw,72px)', margin: '0 0 12px' }}>
          FALE COM<br /><span style={{ color: 'var(--brand-orange)' }}>A GENTE.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--fg-muted)', maxWidth: 480, lineHeight: 1.6 }}>
          Estamos aqui para ajudar. Escolha o canal mais rápido para você.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
        {[
          {
            icon: '💬', color: '#25D366',
            title: 'WhatsApp', sub: 'Resposta em até 30min',
            href: `https://wa.me/${PHONE}?text=Olá! Preciso de ajuda com minha compra.`,
            label: 'Abrir WhatsApp',
          },
          {
            icon: '📧', color: 'var(--brand-orange)',
            title: 'E-mail', sub: 'Resposta em até 24h',
            href: 'mailto:contato@galvaosstore.com.br',
            label: 'Enviar e-mail',
          },
          {
            icon: '📦', color: 'var(--brand-teal)',
            title: 'Rastrear pedido', sub: 'Consulte o status',
            href: '/conta/pedidos',
            label: 'Ver meus pedidos',
          },
          {
            icon: '🔄', color: '#3B82F6',
            title: 'Trocas e devoluções', sub: '7 dias após recebimento',
            href: '/politica-trocas',
            label: 'Ver política',
          },
        ].map(card => (
          <a key={card.title} href={card.href} target={card.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
            style={{
              display: 'block', padding: 24, borderRadius: 14,
              background: 'var(--bg-elev)', border: '1px solid var(--border)',
              textDecoration: 'none', transition: 'border-color .15s, transform .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = card.color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 900, margin: '0 0 4px', color: 'var(--fg)' }}>{card.title}</p>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: '0 0 16px' }}>{card.sub}</p>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: card.color }}>{card.label} →</span>
          </a>
        ))}
      </div>

      {/* Horário */}
      <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 900, margin: '0 0 16px' }}>Horário de atendimento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { day: 'Segunda a Sexta', hours: '09h – 18h' },
            { day: 'Sábado',         hours: '09h – 14h' },
            { day: 'Domingo e feriados', hours: 'Fechado' },
          ].map(h => (
            <div key={h.day}>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', margin: '0 0 2px' }}>{h.day}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: h.hours === 'Fechado' ? 'var(--fg-muted)' : 'var(--fg)', margin: 0 }}>{h.hours}</p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--fg-muted)', marginTop: 16, marginBottom: 0 }}>
          📍 Galvão&apos;s Store · Caraguatatuba/SP
        </p>
      </div>
    </div>
  )
}
