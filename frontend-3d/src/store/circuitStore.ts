import { create } from 'zustand'
import type {
  AppMode,
  CircuitState,
  PlacedComponent,
  SimResult,
  Wire,
} from '../types/circuit'
import { holePosition } from '../lib/breadboard'

interface CircuitStore extends CircuitState {
  setMode: (mode: AppMode) => void
  addComponent: (component: PlacedComponent) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<PlacedComponent>) => void
  rotateSelected: () => void
  addWire: (wire: Wire) => void
  removeWire: (id: string) => void
  select: (id: string | null) => void
  setWireStart: (holeId: string | null) => void
  clearAll: () => void
  setSimulating: (v: boolean) => void
  setLastSim: (r: SimResult | null) => void
  applyLedStates: (states: Record<string, boolean>) => void
  loadDemo: () => void
}

function lift(pos: [number, number, number]): [number, number, number] {
  return [pos[0], pos[1] + 0.05, pos[2]]
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  components: [],
  wires: [],
  selectedId: null,
  mode: 'select',
  wireStartHoleId: null,
  simulating: false,
  lastSim: null,

  setMode: (mode) => set({ mode, wireStartHoleId: null }),

  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
      selectedId: component.id,
    })),

  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  rotateSelected: () => {
    const { selectedId, components } = get()
    if (!selectedId) return
    set({
      components: components.map((c) => {
        if (c.id !== selectedId) return c
        const y = (c.rotation[1] + Math.PI / 2) % (Math.PI * 2)
        return {
          ...c,
          rotation: [c.rotation[0], y, c.rotation[2]] as [number, number, number],
        }
      }),
    })
  },

  addWire: (wire) =>
    set((state) => ({
      wires: [...state.wires, wire],
      wireStartHoleId: null,
    })),

  removeWire: (id) =>
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
    })),

  select: (id) => set({ selectedId: id }),
  setWireStart: (holeId) => set({ wireStartHoleId: holeId }),

  clearAll: () =>
    set({
      components: [],
      wires: [],
      selectedId: null,
      mode: 'select',
      wireStartHoleId: null,
      lastSim: null,
    }),

  setSimulating: (v) => set({ simulating: v }),
  setLastSim: (r) => set({ lastSim: r }),

  applyLedStates: (states) =>
    set((state) => ({
      components: state.components.map((c) => {
        if (c.type !== 'led') return c
        const lit = states[c.id]
        if (lit === undefined) return c
        return { ...c, props: { ...c.props, lit } }
      }),
    })),

  loadDemo: () => {
    const powerId = 'power-demo'
    const resId = 'resistor-demo'
    const ledId = 'led-demo'

    set({
      components: [
        {
          id: powerId,
          type: 'power',
          position: holePosition(5, 2),
          rotation: [0, 0, 0],
          props: { voltage: 5 },
          pins: [
            { id: 'pos', position: [-0.15, 0.02, 0] },
            { id: 'neg', position: [0.15, 0.02, 0] },
          ],
        },
        {
          id: resId,
          type: 'resistor',
          position: holePosition(12, 2),
          rotation: [0, 0, 0],
          props: { value: '330' },
          pins: [
            { id: 'a', position: [-0.35, 0.05, 0] },
            { id: 'b', position: [0.35, 0.05, 0] },
          ],
        },
        {
          id: ledId,
          type: 'led',
          position: holePosition(18, 2),
          rotation: [0, 0, 0],
          props: { color: '#e74c3c', lit: false },
          pins: [
            { id: 'anode', position: [0.05, -0.05, 0] },
            { id: 'cathode', position: [-0.05, 0, 0] },
          ],
        },
      ],
      wires: [
        {
          id: 'wire-demo-1',
          fromHoleId: 'h-5-2',
          toHoleId: 'h-11-2',
          fromPos: lift(holePosition(5, 2)),
          toPos: lift(holePosition(11, 2)),
          color: '#e74c3c',
        },
        {
          id: 'wire-demo-2',
          fromHoleId: 'h-13-2',
          toHoleId: 'h-18-2',
          fromPos: lift(holePosition(13, 2)),
          toPos: lift(holePosition(18, 2)),
          color: '#3498db',
        },
        {
          id: 'wire-demo-3',
          fromHoleId: 'h-19-2',
          toHoleId: 'h-7-2',
          fromPos: lift(holePosition(19, 2)),
          toPos: lift(holePosition(7, 2)),
          color: '#2ecc71',
        },
      ],
      selectedId: null,
      mode: 'select',
      wireStartHoleId: null,
      lastSim: null,
    })
  },
}))
