import { useCircuitStore } from '../store/circuitStore'
import type { ComponentType } from '../types/circuit'
import { holePosition } from '../lib/breadboard'
import { runSimulation } from '../lib/netlist'

const TOOLS: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'power', label: 'منبع ۵V', icon: '⚡' },
  { type: 'resistor', label: 'مقاومت', icon: 'R' },
  { type: 'led', label: 'LED', icon: '💡' },
  { type: 'capacitor', label: 'خازن', icon: 'C' },
  { type: 'acsource', label: 'منبع AC', icon: '~' },
  { type: 'inductor', label: 'سلف', icon: 'L' },
  { type: 'diode', label: 'دیود', icon: 'D' },
  { type: 'ground', label: 'زمین', icon: 'GND' },
  { type: 'button', label: 'دکمه', icon: 'B' },
  { type: 'potentiometer', label: 'پتانسیومتر', icon: 'P' },
  { type: 'transistor', label: 'ترانزیستور', icon: 'Q' },
]

const BOARDS: { key: string; label: string; catalogId: string; accent: string }[] = [
  { key: 'arduino', label: 'Arduino Uno', catalogId: 'board-arduino-uno', accent: '#00979d' },
  { key: 'esp32', label: 'ESP32', catalogId: 'board-esp32-devkit', accent: '#1e40af' },
  { key: 'pico', label: 'Pi Pico', catalogId: 'board-pico', accent: '#16a34a' },
  { key: 'stm32', label: 'STM32', catalogId: 'board-stm32-bluepill', accent: '#0ea5e9' },
]

function createComponent(type: ComponentType) {
  const id = `${type}-${Date.now()}`
  const position = holePosition(14, 4)
  if (type === 'resistor') {
    return { id, type, position, rotation: [0,0,0] as [number,number,number], props: { value: '1k' },
      pins: [{ id: 'a', position: [-0.35,0.05,0] as [number,number,number] }, { id: 'b', position: [0.35,0.05,0] as [number,number,number] }] }
  }
  if (type === 'led') {
    return { id, type, position, rotation: [0,0,0] as [number,number,number], props: { color: '#e74c3c', lit: false },
      pins: [{ id: 'anode', position: [0.05,-0.05,0] as [number,number,number] }, { id: 'cathode', position: [-0.05,0,0] as [number,number,number] }] }
  }
  if (type === 'power') {
    return { id, type, position: holePosition(2, 2), rotation: [0,0,0] as [number,number,number], props: { voltage: 5 },
      pins: [{ id: 'pos', position: [-0.15,0.02,0] as [number,number,number] }, { id: 'neg', position: [0.15,0.02,0] as [number,number,number] }] }
  }
  if (type === 'capacitor') {
    return { id, type, position, rotation: [0,0,0] as [number,number,number], props: { value: '100n' },
      pins: [{ id: 'a', position: [-0.2,0.05,0] as [number,number,number] }, { id: 'b', position: [0.2,0.05,0] as [number,number,number] }] }
  }
  if (type === 'acsource') {
    return { id, type: 'acsource' as any, position: holePosition(4, 4), rotation: [0,0,0] as [number,number,number],
      props: { amplitude: 5, frequency: 50, wave: 'sine', ac: true },
      pins: [{ id: 'pos', position: [-0.15,0.02,0] as [number,number,number] }, { id: 'neg', position: [0.15,0.02,0] as [number,number,number] }] }
  }
  if (type === 'inductor') {
    return { id, type: 'inductor' as any, position, rotation: [0,0,0] as [number,number,number], props: { value: '1m' },
      pins: [{ id: 'a', position: [-0.35,0.05,0] as [number,number,number] }, { id: 'b', position: [0.35,0.05,0] as [number,number,number] }] }
  }
  if (type === 'diode') {
    return { id, type: 'diode' as any, position, rotation: [0,0,0] as [number,number,number], props: { vf: 0.7 },
      pins: [{ id: 'a', position: [-0.28,0.05,0] as [number,number,number] }, { id: 'k', position: [0.28,0.05,0] as [number,number,number] }] }
  }
  if (type === 'ground') {
    return { id, type: 'ground' as any, position: holePosition(8, 8), rotation: [0,0,0] as [number,number,number], props: {},
      pins: [{ id: 'gnd', position: [0,0.02,0] as [number,number,number] }] }
  }
  if (type === 'button') {
    return { id, type: 'button' as any, position: holePosition(10, 6), rotation: [0,0,0] as [number,number,number],
      props: { pressed: false, arduinoPin: 2 },
      pins: [{ id: 'a', position: [-0.08,0.02,0] as [number,number,number] }, { id: 'b', position: [0.08,0.02,0] as [number,number,number] }] }
  }
  if (type === 'potentiometer') {
    return { id, type: 'potentiometer' as any, position: holePosition(16, 6), rotation: [0,0,0] as [number,number,number],
      props: { analogValue: 512, arduinoPin: 14 },
      pins: [{ id: 'a', position: [-0.12,0.02,0] as [number,number,number] }, { id: 'w', position: [0,0.02,0] as [number,number,number] }, { id: 'b', position: [0.12,0.02,0] as [number,number,number] }] }
  }
  if (type === 'transistor') {
    return { id, type: 'transistor' as any, position, rotation: [0,0,0] as [number,number,number], props: { kind: 'NPN' },
      pins: [
        { id: 'b', position: [-0.08,0.02,0.08] as [number,number,number] },
        { id: 'c', position: [0,0.02,0.08] as [number,number,number] },
        { id: 'e', position: [0.08,0.02,0.08] as [number,number,number] },
      ] }
  }
  return null
}

function createBoard(b: (typeof BOARDS)[0]) {
  return {
    id: `module-${b.key}-${Date.now()}`,
    type: 'module' as const,
    position: holePosition(5, 8),
    rotation: [0, 0, 0] as [number, number, number],
    catalogId: b.catalogId,
    label: b.label,
    props: { label: b.label, accent: b.accent },
    pins: [
      { id: '1', position: [-0.25, 0, -0.22] as [number, number, number] },
      { id: '2', position: [0.25, 0, -0.22] as [number, number, number] },
    ],
  }
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

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 max-w-[220px] max-h-[90vh] overflow-y-auto">
      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl">
        <div className="text-xs text-slate-400 mb-2 text-center">قطعات</div>
        <div className="flex flex-col gap-1.5">
          {TOOLS.map((tool) => (
            <button key={tool.type} onClick={() => handleAdd(tool.type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
              <span className="w-8 text-center font-bold text-xs">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl">
        <div className="text-xs text-slate-400 mb-2 text-center">بردها / MCU</div>
        <div className="flex flex-col gap-1.5">
          {BOARDS.map((b) => (
            <button key={b.key} onClick={() => { setMode('select'); addComponent(createBoard(b) as any) }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition">
              <span className="w-2 h-2 rounded-full" style={{ background: b.accent }} />
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl flex flex-col gap-2">
        <div className="text-xs text-slate-400 text-center mb-1">حالت</div>
        <button onClick={() => setMode('select')}
          className={`px-3 py-2 rounded-lg text-sm transition ${mode === 'select' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>انتخاب</button>
        <button onClick={() => setMode('wire')}
          className={`px-3 py-2 rounded-lg text-sm transition ${mode === 'wire' ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>سیم‌کشی</button>
        {mode === 'wire' && (
          <div className="text-[11px] text-amber-200/90">{wireStartHoleId ? 'سوراخ دوم' : 'سوراخ اول'}</div>
        )}
      </div>

      {selected && (selected.type === 'resistor' || selected.type === 'capacitor' || selected.type === 'inductor') && (
        <div className="bg-slate-800/90 border border-slate-600 rounded-xl p-3">
          <div className="text-xs text-slate-400 mb-1">مقدار</div>
          <input className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-white text-sm"
            value={String(selected.props.value || '')}
            onChange={(e) => updateComponent(selected.id, { props: { ...selected.props, value: e.target.value } })} />
        </div>
      )}

      <div className="bg-slate-800/90 border border-slate-600 rounded-xl p-3 flex flex-col gap-2">
        <button onClick={handleSimulate} disabled={simulating || components.length === 0}
          className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-medium">
          {simulating ? 'شبیه‌سازی…' : '▶ شبیه‌سازی'}
        </button>
        <button onClick={rotateSelected} disabled={!selectedId} className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm disabled:opacity-40">چرخش ۹۰°</button>
        <button onClick={() => selectedId && removeComponent(selectedId)} disabled={!selectedId}
          className="px-3 py-2 rounded-lg bg-red-700/80 text-white text-sm disabled:opacity-40">حذف</button>
        <button onClick={loadDemo} className="px-3 py-2 rounded-lg bg-indigo-700 text-white text-sm">مدار نمونه</button>
        <button onClick={clearAll} disabled={!components.length && !wires.length}
          className="px-3 py-2 rounded-lg bg-slate-700 text-white text-sm disabled:opacity-40">پاک کردن</button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300">
        <div className="flex justify-between"><span>{components.length} قطعه</span><span>{wires.length} سیم</span></div>
        {lastSim && <div className={`mt-2 text-[11px] ${lastSim.ok ? 'text-emerald-300' : 'text-red-300'}`}>{lastSim.message}</div>}
      </div>
    </div>
  )
}
