export function Sk({ w = '100%', h = 16, r = 6, mb = 0 }: {
  w?: number | string; h?: number; r?: number; mb?: number
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #1E2530 25%, #2A3340 50%, #1E2530 75%)',
      backgroundSize: '200% 100%',
      animation: 'sk-shimmer 1.4s infinite',
      marginBottom: mb,
      flexShrink: 0,
    }} />
  )
}

export function SkRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #141922' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <Sk h={14} w={i === 0 ? '60%' : i === cols - 1 ? '40%' : '80%'} />
        </td>
      ))}
    </tr>
  )
}

export function SkCard({ h = 100 }: { h?: number }) {
  return (
    <div style={{ background: '#0F1318', border: '1px solid #1E2530', borderRadius: 14, padding: 22, height: h, animation: 'sk-pulse 1.6s ease-in-out infinite' }} />
  )
}

export const skStyle = `
  @keyframes sk-shimmer {
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
  }
  @keyframes sk-pulse {
    0%, 100% { opacity: 1 }
    50%       { opacity: .55 }
  }
`
