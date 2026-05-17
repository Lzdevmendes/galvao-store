'use client'

import { useTransition, useState } from 'react'
import { saveSettings } from './actions'

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '1px solid #1E2530', background: '#141922',
  color: '#F8F9FB', fontSize: 14, outline: 'none',
  fontFamily: 'Space Grotesk, sans-serif', boxSizing: 'border-box',
  transition: 'border-color .15s',
}

function Field({ label, name, value, type = 'text', placeholder, hint }: {
  label: string; name: string; value?: string
  type?: string; placeholder?: string; hint?: string
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700 }}>
        {label}
      </label>
      <input name={name} defaultValue={value ?? ''} type={type} placeholder={placeholder} style={inp}
        onFocus={e => (e.target.style.borderColor = '#F26B1F')}
        onBlur={e => (e.target.style.borderColor = '#1E2530')}
      />
      {hint && <p style={{ fontSize: 11, color: '#4A5462', marginTop: 4, fontFamily: 'Space Grotesk, sans-serif' }}>{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 12, padding: 28, marginBottom: 20 }}>
      <h3 style={{ fontFamily: 'Archivo Black, sans-serif', fontSize: 15, margin: '0 0 24px', color: '#F8F9FB' }}>{title}</h3>
      {children}
    </div>
  )
}

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaved(false)
    start(async () => {
      await saveSettings(new FormData(e.currentTarget))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Section title="Dados da Loja">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nome da loja" name="store_name" value={settings.store_name} placeholder="Galvão's Store" />
          <Field label="E-mail de contato" name="store_email" value={settings.store_email} placeholder="contato@galvaosstore.com.br" type="email" />
          <Field label="Telefone / WhatsApp" name="store_whatsapp" value={settings.store_whatsapp} placeholder="(12) 99999-9999" hint="Usado no botão de WhatsApp do site" />
          <Field label="Telefone fixo" name="store_phone" value={settings.store_phone} placeholder="(12) 3333-3333" />
        </div>
        <Field label="Endereço da loja" name="store_address" value={settings.store_address} placeholder="Rua..., Caraguatatuba/SP" hint="Exibido no rodapé e e-mails" />
      </Section>

      <Section title="Configurações Comerciais">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Frete grátis acima de (R$)" name="free_shipping_threshold" value={settings.free_shipping_threshold ?? '399'} type="number" placeholder="399" hint="Valor em reais. Ex: 399 = R$ 399" />
          <Field label="Desconto PIX (%)" name="pix_discount_pct" value={settings.pix_discount_pct ?? '5'} type="number" placeholder="5" hint="Percentual de desconto para pagamento via PIX" />
        </div>
      </Section>

      <Section title="Redes Sociais">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Instagram" name="instagram_url" value={settings.instagram_url} placeholder="https://instagram.com/galvaosstore" />
          <Field label="Facebook" name="facebook_url" value={settings.facebook_url} placeholder="https://facebook.com/galvaosstore" />
        </div>
      </Section>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button type="submit" disabled={pending} style={{
          padding: '13px 28px', borderRadius: 8, border: 'none',
          background: pending ? '#1E2530' : '#F26B1F', color: '#fff',
          fontSize: 14, fontWeight: 700, cursor: pending ? 'not-allowed' : 'pointer',
          fontFamily: 'Space Grotesk, sans-serif',
        }}>
          {pending ? 'Salvando...' : 'Salvar configurações'}
        </button>
        {saved && <p style={{ fontSize: 13, color: '#2CB35A', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>✅ Configurações salvas!</p>}
      </div>
    </form>
  )
}
