import { useCircuitStore } from '../store/circuitStore'
import type { ComponentType } from '../types/circuit'
import { holePosition } from '../lib/breadboard'

const TOOLS: { type: ComponentType; label: string; icon: string }[] = [
  { type: 'resistor', label: 'مقاومت', icon: 'R' },
  { type: 'led', label: 'LED', icon: '💡' },
]

function createComponent(type: ComponentType) {
  const id = `${type}-${Date.now()}`
  const position = holePosition(14, 4)

  if (type === 'resistor') {
    return {
      id,
      type,
      position,
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
      id,
      type,
      position,
      rotation: [0, 0, 0] as [number, number, number],
      props: { color: '#e74c3c', lit: false },
      pins: [
        { id: 'anode', position: [0.05, -0.05, 0] as [number, number, number] },
        { id: 'cathode', position: [-0.05, 0, 0] as [number, number, number] },
      ],
    }
  }

  return null
}

export function Toolbar() {
  const { addComponent, clearAll, components, selectedId, removeComponent } =
    useCircuitStore()

  const handleAdd = (type: ComponentType) => {
    const comp = createComponent(type)
    if (comp) addComponent(comp)
  }

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl">
        <div className="text-xs text-slate-400 mb-2 text-center">قطعات</div>
        <div className="flex flex-col gap-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.type}
              onClick={() => handleAdd(tool.type)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
            >
              <span className="w-6 text-center font-bold">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl p-3 shadow-xl flex flex-col gap-2">
        <button
          onClick={() => selectedId && removeComponent(selectedId)}
          disabled={!selectedId}
          className="px-3 py-2 rounded-lg bg-red-700/80 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition"
        >
          حذف انتخاب‌شده
        </button>
        <button
          onClick={clearAll}
          disabled={components.length === 0}
          className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition"
        >
          پاک کردن همه
        </button>
      </div>

      <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 text-center">
        {components.length} قطعه
        {selectedId && (
          <div className="text-cyan-400 mt-1 truncate max-w-[120px]">انتخاب‌شده</div>
        )}
      </div>

      <div className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-[11px] text-slate-400 leading-relaxed max-w-[160px]">
        قطعه را بگیر و جابه‌جا کن.
        <br />
        نزدیک سوراخ رها کن تا بچسبد.
      </div>
    </div>
  )
}
