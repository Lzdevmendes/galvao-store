'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useState } from 'react'

type SalesPoint = { label: string; atual: number; anterior: number }

function fmtK(v: number) {
  if (v >= 1000) return `R$ ${(v / 100000).toFixed(0)}k`
  return `R$ ${(v / 100).toFixed(0)}`
}

export function SalesDashboardChart({ data }: { data: SalesPoint[] }) {
  const [tab, setTab] = useState<'R$' | 'Pedidos'>('R$')

  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4A5462', margin: '0 0 4px' }}>Vendas — últimos 30 dias</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['R$', 'Pedidos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
              background: tab === t ? '#F26B1F' : '#1E2530',
              color: tab === t ? '#fff' : '#6B7280',
              cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradAtual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F26B1F" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#F26B1F" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradAnterior" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1FB5A8" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#1FB5A8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#4A5462' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={tab === 'R$' ? fmtK : v => String(v)} tick={{ fontSize: 10, fill: '#4A5462' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#9CA3AF', marginBottom: 4 }}
            formatter={(v: number) => tab === 'R$' ? [`R$ ${(v / 100).toFixed(2)}`, ''] : [v, '']}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            formatter={v => <span style={{ color: '#9CA3AF' }}>{v === 'atual' ? 'Atual' : 'Período anterior'}</span>}
          />
          <Area type="monotone" dataKey="atual" name="atual" stroke="#F26B1F" strokeWidth={2} fill="url(#gradAtual)" dot={false} activeDot={{ r: 4, fill: '#F26B1F' }} />
          <Area type="monotone" dataKey="anterior" name="anterior" stroke="#1FB5A8" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#gradAnterior)" dot={false} activeDot={{ r: 3, fill: '#1FB5A8' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

type BrandBar = { name: string; pct: number; revenue: number; color: string }

export function BrandsSharePanel({ brands }: { brands: BrandBar[] }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, padding: '20px 24px', height: '100%' }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4A5462', margin: '0 0 20px' }}>Marcas — Share</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {brands.map(b => (
          <div key={b.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#F8F9FB' }}>{b.name}</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                <strong style={{ color: '#9CA3AF' }}>{b.pct}%</strong>
                {' · '}
                R$ {(b.revenue / 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ height: 6, background: '#1E2530', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 99, transition: 'width .5s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
