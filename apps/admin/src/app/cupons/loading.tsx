import { Sk, skStyle } from '@/components/skeleton'

function CouponCardSkeleton() {
  return (
    <div style={{ background:'#0F1318', border:'1px solid #1E2530', borderRadius:10, padding:18, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'#1E2530' }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <Sk w={70} h={20} r={999} />
        <Sk w={60} h={22} r={6} />
      </div>
      <Sk w={160} h={22} r={4} mb={8} />
      <Sk w={220} h={13} r={4} mb={18} />
      <div style={{ display:'flex', gap:20 }}>
        <div><Sk w={50} h={10} r={3} mb={6} /><Sk w={40} h={16} r={3} /></div>
        <div><Sk w={50} h={10} r={3} mb={6} /><Sk w={50} h={16} r={3} /></div>
        <div><Sk w={50} h={10} r={3} mb={6} /><Sk w={40} h={16} r={3} /></div>
      </div>
    </div>
  )
}

export default function CuponsLoading() {
  return (
    <>
      <style>{skStyle}</style>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div><Sk w={200} h={28} r={6} mb={8} /><Sk w={280} h={13} r={4} /></div>
        <Sk w={140} h={40} r={8} />
      </div>
      {/* Tabs */}
      <div style={{ display:'flex', gap:24, borderBottom:'1px solid #1E2530', marginBottom:24, paddingBottom:12 }}>
        {[70,80,80,60,50].map((w,i) => <Sk key={i} w={w} h={14} r={4} />)}
      </div>
      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {Array.from({ length: 9 }).map((_,i) => <CouponCardSkeleton key={i} />)}
      </div>
    </>
  )
}
