import { useCircuitStore } from '../store/circuitStore'
import type { ComponentType } from '../types/circuit'
import { holePosition } from '../lib/breadboard'
import { runSimulation } from '../lib/netlist'

const TOOLS: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'power', label: 'منبع ۵V', icon: '⚡' },
  { type: 'resistor', label: 'مقاومت', icon: 'R' },
  { type: 'led', label: 'LED', icon: '💡' },
  { type: 'capacitor', label: 'خازن', icon: 'C' },
]

function createComponent(type: ComponentType) {
  const id = `${type}-${Date.now()}`
  const position = holePosition(14, 4)

  if (type === 'resistor') {
    return {
      id, type, position,
      rotation: [0, 0, 0] as [number, number, number],
      props: { value: '1k' },
      pins: [
        { id: 'a', position: [-0.35, 0.05, 0] as [number, number, number] },
        { id: 'b', position: [0.35, 0.05, 0] as [number, number, number] },
      ],
    }
  }
  if (type === 'led') {
    return {
      id, type, position,
      rotation: [0, 0, 0] as [number, number, number],
      props: { color: '#e74c3c', lit: false },
      pins: [
        { id: 'anode', position: [0.05, -0.05, 0] as [number, number, number] },
        { id: 'cathode', position: [-0.05, 0, 0] as [number, number, number] },
      ],
    }
  }
  if (type === 'power') {
    return {
      id, type, position: holePosition(2, 2),
      rotation: [0, 0, 0] as [number, number, number],
      props: { voltage: 5 },
      pins: [
        { id: 'pos', position: [-0.15, 0.02, 0] as [number, number, number] },
        { id: 'neg', position: [0.15, 0.02, 0] as [number, number, number] },
      ],
    }
  }
  if (type === 'capacitor') {
    return {
      id, type, position,
      rotation: [0, 0, 0] as [number, number, number],
      props: { value: '100n' },
      pins: [
        { id: 'a', position: [-0.2, 0.05, 0] as [number, number, number] },
        { id: 'b', position: [0.2, 0.05, 0] as [number, number, number] },
      ],
    }
  }
  return null
}

export function Toolbar() {
  const {
    addComponent, clearAll, components, wires, selectedId, removeComponent,
    mode, setMode, wireStartHoleId, simulating, setSimulating, setLastSim,
    applyLedStates, lastSim, rotateSelected, updateComponent, loadDemo,
  } = useCircuitStore()

  const selected = components.find((c) => c.id === selectedId)

  const handleAdd = (type: ComponentType) => {
    setMode('select')
    const comp = createComponent(type)
    if (comp) addComponent(comp)
  }

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const result = await runSimulation(components, wires)
      setLastSim({ ok: result.ok, message: result.message, ledStates: result.ledStates, netlist: result.netlist })
      applyLedStates(result.ledStates)
    } finally {
      setSimulating(false)
    }
  }

  const downloadNetlist = () => {
    if (!lastSim?.netlist) return
    const blob = new Blob([lastSim.netlist], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'electrolab-circuit.cir'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 max-w-[210px]">
      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl">
        <div className="text-xs text-slate-400 mb-2 text-center">قطعات</div>
        <div className="flex flex-col gap-2">
          {TOOLS.map((tool) => (
            <button key={tool.type} onClick={() => handleAdd(tool.type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
              <span className="w-6 text-center font-bold">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl flex flex-col gap-2">
        <div className="text-xs text-slate-400 text-center mb-1">حالت</div>
        <button onClick={() => setMode('select')}
          className={`px-3 py-2 rounded-lg text-sm transition ${mode === 'select' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
          انتخاب / جابه‌جایی
        </button>
        <button onClick={() => setMode('wire')}
          className={`px-3 py-2 rounded-lg text-sm transition ${mode === 'wire' ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
          سیم‌کشی
        </button>
        {mode === 'wire' && (
          <div className="text-[11px] text-amber-200/90 leading-relaxed">
            {wireStartHoleId ? 'حالا سوراخ دوم را کلیک کنید' : 'روی یک سوراخ کلیک کنید تا سیم شروع شود'}
          </div>
        )}
      </div>

      {selected && (selected.type === 'resistor' || selected.type === 'capacitor') && (
        <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl">
          <div className="text-xs text-slate-400 mb-1">مقدار قطعه</div>
          <input className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-white text-sm"
            value={String(selected.props.value || '')}
            onChange={(e) => updateComponent(selected.id, { props: { ...selected.props, value: e.target.value } })}
            placeholder={selected.type === 'resistor' ? '1k' : '100n'} />
        </div>
      )}

      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl flex flex-col gap-2">
        <button onClick={handleSimulate} disabled={simulating || components.length === 0}
          className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition">
          {simulating ? 'در حال شبیه‌سازی…' : '▶ شبیه‌سازی / تست'}
        </button>
        <button onClick={rotateSelected} disabled={!selectedId}
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition">چرخش ۹۰°</button>
        <button onClick={() => selectedId && removeComponent(selectedId)} disabled={!selectedId}
          className="px-3 py-2 rounded-lg bg-red-700/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition">حذف انتخاب‌شده</button>
        <button onClick={loadDemo}
          className="px-3 py-2 rounded-lg bg-indigo-700/80 hover:bg-indigo-600 text-white text-sm transition">بارگذاری مدار نمونه</button>
        <button onClick={clearAll} disabled={components.length === 0 && wires.length === 0}
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition">پاک کردن همه</button>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
        <div className="flex justify-between"><span>{components.length} قطعه</span><span>{wires.length} سیم</span></div>
        {lastSim && (
          <div className={`mt-2 text-[11px] leading-relaxed ${lastSim.ok ? 'text-emerald-300' : 'text-red-300'}`}>{lastSim.message}</div>
        )}
      </div>

      {lastSim?.netlist && (
        <details className="bg-slate-900/80 border border-slate-700 rounded-lg text-[10px] text-slate-400">
          <summary className="px-3 py-2 cursor-pointer hover:text-slate-200">نت‌لیست SPICE</summary>
          <pre className="px-3 pb-2 overflow-auto max-h-40 whitespace-pre-wrap dir-ltr text-left">{lastSim.netlist}</pre>
          <button onClick={downloadNetlist} className="mx-3 mb-2 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px]">دانلود .cir</button>
        </details>
      )}
    </div>
  )
}
