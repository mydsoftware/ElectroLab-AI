import { create } from 'zustand'
import type {
  AppMode,
  CircuitState,
  PlacedComponent,
  SimResult,
  Wire,
} from '../types/circuit'

interface CircuitStore extends CircuitState {
  setMode: (mode: AppMode) => void
  addComponent: (component: PlacedComponent) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<PlacedComponent>) => void
  addWire: (wire: Wire) => void
  removeWire: (id: string) => void
  select: (id: string | null) => void
  setWireStart: (holeId: string | null) => void
  clearAll: () => void
  setSimulating: (v: boolean) => void
  setLastSim: (r: SimResult | null) => void
  applyLedStates: (states: Record<string, boolean>) => void
}

export const useCircuitStore = create<CircuitStore>((set) => ({
  components: [],
  wires: [],
  selectedId: null,
  mode: 'select',
  wireStartHoleId: null,
  simulating: false,
  lastSim: null,

  setMode: (mode) =>
    set({ mode, wireStartHoleId: null }),

  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
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
}))
