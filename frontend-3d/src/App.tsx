import { useEffect, useState } from 'react'
import { Scene } from './components/Scene'
import { Toolbar } from './components/Toolbar'
import { CatalogPanel } from './components/CatalogPanel'
import { ScopePanel } from './components/ScopePanel'
import { MeterPanel } from './components/MeterPanel'
import { McuPanel } from './components/McuPanel'
import { HelpPanel } from './components/HelpPanel'
import { useCircuitStore } from './store/circuitStore'
import { autosave, loadAutosave } from './lib/autosave'

export default function App() {
  const [catalogOpen, setCatalogOpen] = useState(false)
  const mode = useCircuitStore((s) => s.mode)
  const setMode = useCircuitStore((s) => s.setMode)
  const removeComponent = useCircuitStore((s) => s.removeComponent)
  const selectedId = useCircuitStore((s) => s.selectedId)
  const rotateSelected = useCircuitStore((s) => s.rotateSelected)
  const components = useCircuitStore((s) => s.components)
  const wires = useCircuitStore((s) => s.wires)
  const scopeCh1 = useCircuitStore((s) => s.scopeCh1)
  const scopeCh2 = useCircuitStore((s) => s.scopeCh2)
  const loadProjectData = useCircuitStore((s) => s.loadProjectData)
  const mcuAssignPin = useCircuitStore((s) => s.mcuAssignPin)
  const setMcuAssignPin = useCircuitStore((s) => s.setMcuAssignPin)
  const pinHoverLabel = useCircuitStore((s) => s.pinHoverLabel)

  useEffect(() => {
    const saved = loadAutosave()
    if (saved && saved.components.length > 0) loadProjectData(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      autosave(components, wires, { scopeCh1, scopeCh2 })
    }, 600)
    return () => clearTimeout(t)
  }, [components, wires, scopeCh1, scopeCh2])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'w' || e.key === 'W') setMode('wire')
      if (e.key === 'v' || e.key === 'V' || e.key === 'Escape') setMode('select')
      if (e.key === 'p' || e.key === 'P') setMode('probe')
      if (e.key === 'r' || e.key === 'R') rotateSelected()
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeComponent(selectedId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setMode, rotateSelected, removeComponent, selectedId])

  return (
    <div className="relative w-full h-full">
      <Scene />
      <Toolbar onOpenCatalog={() => setCatalogOpen(true)} />
      <ScopePanel />
      <MeterPanel />
      <McuPanel />
      <HelpPanel />
      <CatalogPanel open={catalogOpen} onClose={() => setCatalogOpen(false)} />

      {pinHoverLabel && mcuAssignPin === null && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900/90 border border-slate-600 text-cyan-300 px-3 py-1 rounded-lg text-sm font-mono shadow-lg">
          {pinHoverLabel}
        </div>
      )}

      {mcuAssignPin !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-slate-900 px-4 py-2 rounded-xl shadow-xl text-sm font-medium flex items-center gap-3">
          <span>
            پایه MCU{' '}
            <strong>{mcuAssignPin >= 14 ? `A${mcuAssignPin - 14}` : `D${mcuAssignPin}`}</strong>{' '}
            — روی LED / دکمه / پتانسیومتر کلیک کنید
          </span>
          <button onClick={() => setMcuAssignPin(null)} className="px-2 py-0.5 rounded bg-slate-900/20 text-xs">لغو</button>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
          <h1 className="text-white font-bold text-lg tracking-tight">
            ElectroLab <span className="text-cyan-400">3D</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">شبیه‌ساز آزمایشگاه الکترونیک · v0.9</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-slate-400 bg-slate-900/70 px-3 py-2 rounded-lg max-w-xl text-center">
        {mode === 'wire' ? (
          <span><span className="text-amber-400">سیم‌کشی</span> · Esc خروج</span>
        ) : mode === 'probe' ? (
          <span className="text-cyan-400">پروب CH1/CH2</span>
        ) : (
          <span>W سیم · P پروب · R چرخش · Del حذف · ذخیره خودکار</span>
        )}
      </div>
    </div>
  )
}
