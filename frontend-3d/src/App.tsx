import { Scene } from './components/Scene'
import { Toolbar } from './components/Toolbar'

export default function App() {
  return (
    <div className="relative w-full h-full">
      <Scene />
      <Toolbar />

      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
          <h1 className="text-white font-bold text-lg tracking-tight">
            ElectroLab <span className="text-cyan-400">3D</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            شبیه‌ساز آزمایشگاه الکترونیک
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-500 bg-slate-900/60 px-3 py-2 rounded-lg">
        چرخش: کلیک چپ + درگ · زوم: اسکرول · پن: کلیک راست · جابه‌جایی قطعه: کلیک روی قطعه + درگ
      </div>
    </div>
  )
}
