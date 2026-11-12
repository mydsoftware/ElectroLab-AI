import { useEffect } from 'react'
import { Scene } from './components/Scene'
import { Toolbar } from './components/Toolbar'
import { useCircuitStore } from './store/circuitStore'

export default function App() {
  const mode = useCircuitStore((s) => s.mode)
  const setMode = useCircuitStore((s) => s.setMode)
  const removeComponent = useCircuitStore((s) => s.removeComponent)
  const selectedId = useCircuitStore((s) => s.selectedId)
  const rotateSelected = useCircuitStore((s) => s.rotateSelected)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'w' || e.key === 'W') setMode('wire')
      if (e.key === 'v' || e.key === 'V' || e.key === 'Escape') setMode('select')
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
      <Toolbar />

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
          <h1 className="text-white font-bold text-lg tracking-tight">
            ElectroLab <span className="text-cyan-400">3D</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">شبیه‌ساز آزمایشگاه الکترونیک</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-400 bg-slate-900/70 px-3 py-2 rounded-lg max-w-lg leading-relaxed">
        {mode === 'wire' ? (
          <>
            <span className="text-amber-400 font-medium">سیم‌کشی:</span> دو سوراخ را کلیک کنید · Esc خروج
          </>
        ) : (
          <>W سیم · R چرخش · Del حذف · درگ قطعه برای جابه‌جایی</>
        )}
      </div>
    </div>
  )
}
