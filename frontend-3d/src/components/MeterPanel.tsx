import { useMemo } from 'react'
import { useCircuitStore } from '../store/circuitStore'

export function MeterPanel() {
  const scopeData = useCircuitStore((s) => s.scopeData)
  const scopeCh1 = useCircuitStore((s) => s.scopeCh1)
  const scopeCh2 = useCircuitStore((s) => s.scopeCh2)
  const lastSim = useCircuitStore((s) => s.lastSim)

  const reading = useMemo(() => {
    if (scopeData && scopeData.series.length) {
      const ch1 = scopeData.series.find((s) => s.name === 'CH1')
      const ch2 = scopeData.series.find((s) => s.name === 'CH2')
      const primary = ch1 || scopeData.series[0]
      const ys = primary.y
      if (!ys.length) return null
      let min = ys[0],
        max = ys[0],
        sum = 0,
        sumSq = 0
      for (const v of ys) {
        if (v < min) min = v
        if (v > max) max = v
        sum += v
        sumSq += v * v
      }
      const n = ys.length
      const mean = sum / n
      const rms = Math.sqrt(sumSq / n)
      const pp = max - min
      let diffRms: number | null = null
      if (ch1 && ch2 && ch1.y.length === ch2.y.length) {
        let s2 = 0
        for (let i = 0; i < ch1.y.length; i++) {
          const d = ch1.y[i] - ch2.y[i]
          s2 += d * d
        }
        diffRms = Math.sqrt(s2 / ch1.y.length)
      }
      return { mode: 'AC/transient' as const, vpp: pp, vrms: rms, vmean: mean, vmax: max, vmin: min, diffRms, label: primary.name }
    }
    if (lastSim?.nodeVoltages && Object.keys(lastSim.nodeVoltages).length) {
      const vals = Object.values(lastSim.nodeVoltages)
      const max = Math.max(...vals)
      const min = Math.min(...vals)
      return {
        mode: 'DC' as const,
        vpp: max - min,
        vrms: max,
        vmean: vals.reduce((a, b) => a + b, 0) / vals.length,
        vmax: max,
        vmin: min,
        diffRms: null,
        label: 'nodes',
      }
    }
    return null
  }, [scopeData, lastSim])

  if (!reading) return null

  const fmt = (v: number) => (Math.abs(v) >= 1 ? `${v.toFixed(3)} V` : `${(v * 1000).toFixed(2)} mV`)

  return (
    <div className="absolute bottom-4 left-4 z-20 w-[260px] bg-slate-950/95 border border-emerald-800 rounded-xl shadow-2xl overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex justify-between items-center">
        <span className="text-emerald-300 text-sm font-medium">مولتی‌متر</span>
        <span className="text-[10px] text-slate-500">{reading.mode}</span>
      </div>
      <div className="p-3 font-mono">
        <div className="text-2xl text-emerald-400 tabular-nums">
          {fmt(reading.vrms)}
          <span className="text-xs text-slate-500 mr-2"> RMS</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-300">
          <div>Vpp: {fmt(reading.vpp)}</div>
          <div>Mean: {fmt(reading.vmean)}</div>
          <div>Max: {fmt(reading.vmax)}</div>
          <div>Min: {fmt(reading.vmin)}</div>
        </div>
        {reading.diffRms !== null && (
          <div className="mt-2 text-xs text-cyan-300">CH1−CH2 RMS: {fmt(reading.diffRms)}</div>
        )}
        <div className="mt-2 text-[10px] text-slate-500">
          کانال: {reading.label}
          {scopeCh1 ? ` · پروب1` : ''}
          {scopeCh2 ? ` · پروب2` : ''}
        </div>
      </div>
    </div>
  )
}
