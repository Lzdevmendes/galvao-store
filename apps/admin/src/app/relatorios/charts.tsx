'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const ORANGE = '#F26B1F'
const TEAL   = '#1FB5A8'

const fmt = (v: number) => (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

interface CustomTooltipProps { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string }

function CTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 10, padding: '10px 16px', fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}>
      {label && <p style={{ color: '#9CA3AF', marginBottom: 6, fontSize: 11 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? '#F8F9FB', margin: '2px 0', fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export function RevenueAreaChart({ data }: { data: { label: string; total: number; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={ORANGE} stopOpacity={.3} />
            <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
        <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `R$${(v/100).toFixed(0)}`} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CTooltip />} />
        <Area type="monotone" dataKey="total" name="Receita" stroke={ORANGE} strokeWidth={2.5} fill="url(#gradOrange)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OrdersBarChart({ data }: { data: { label: string; orders: number; cancelled: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" />
        <XAxis dataKey="label" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CTooltip />} />
        <Bar dataKey="orders" name="Pedidos" fill={TEAL} radius={[4,4,0,0]} />
        <Bar dataKey="cancelled" name="Cancelados" fill="#2A323D" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PaymentPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
        </Pie>
        <Tooltip formatter={(v: unknown) => [`${v}%`, '']} contentStyle={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 8, fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: '#9CA3AF', fontSize: 12 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2530" horizontal={false} />
        <XAxis type="number" tickFormatter={v => `R$${(v/100).toFixed(0)}`} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CTooltip />} />
        <Bar dataKey="total" name="Receita" fill={ORANGE} radius={[0,4,4,0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
