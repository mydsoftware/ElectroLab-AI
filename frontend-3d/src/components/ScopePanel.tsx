import { useMemo } from 'react'
import { useCircuitStore } from '../store/circuitStore'

const COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fbbf24']

export function ScopePanel() {
  const scopeData = useCircuitStore((s) => s.scopeData)
  const setScopeData = useCircuitStore((s) => s.setScopeData)

  const paths = useMemo(() => {
    if (!scopeData || !scopeData.t.length) return []
    const w = 480
    const h = 160
    const pad = 8
    const t = scopeData.t
    const t0 = t[0]
    const t1 = t[t.length - 1] || 1
    let yMin = Infinity
    let yMax = -Infinity
    for (const s of scopeData.series) {
      for (const v of s.y) {
        if (v < yMin) yMin = v
        if (v > yMax) yMax = v
      }
    }
    if (!Number.isFinite(yMin)) yMin = -1
    if (!Number.isFinite(yMax)) yMax = 1
    if (yMax - yMin < 1e-6) {
      yMax += 1
      yMin -= 1
    }
    const mapX = (ti: number) => pad + ((ti - t0) / (t1 - t0 || 1)) * (w - 2 * pad)
    const mapY = (v: number) => pad + (1 - (v - yMin) / (yMax - yMin)) * (h - 2 * pad)
    return scopeData.series.map((s, si) => {
      const pts = s.y
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${mapX(t[i]).toFixed(1)},${mapY(v).toFixed(1)}`)
        .join(' ')
      return { name: s.name, d: pts, color: COLORS[si % COLORS.length] }
    })
  }, [scopeData])

  if (!scopeData) return null

  return (
    <div className="absolute bottom-4 right-4 z-20 w-[520px] bg-slate-950/95 border border-cyan-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <div>
          <div className="text-cyan-300 text-sm font-medium">اسیلوسکوپ</div>
          <div className="text-[10px] text-slate-500">{scopeData.message}</div>
        </div>
        <button onClick={() => setScopeData(null)} className="text-slate-500 hover:text-white text-sm px-2">
          ✕
        </button>
      </div>
      <svg viewBox="0 0 480 160" className="w-full h-40 bg-[#0a0f1a]">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={48 * i} y1={0} x2={48 * i} y2={160} stroke="#1e293b" strokeWidth={1} />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={32 * i} x2={480} y2={32 * i} stroke="#1e293b" strokeWidth={1} />
        ))}
        {paths.map((p) => (
          <path key={p.name} d={p.d} fill="none" stroke={p.color} strokeWidth={2} />
        ))}
      </svg>
      <div className="flex gap-3 px-3 py-2 text-[11px]">
        {paths.map((p) => (
          <span key={p.name} style={{ color: p.color }}>
            ● {p.name}
          </span>
        ))}
      </div>
    </div>
  )
}
