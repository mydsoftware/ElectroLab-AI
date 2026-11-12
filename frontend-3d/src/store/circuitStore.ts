import { create } from 'zustand'
import type { CircuitState, ComponentType, PlacedComponent, Wire } from '../types/circuit'

interface CircuitStore extends CircuitState {
  setMode: (mode: CircuitState['mode']) => void
  setPlacingType: (type: ComponentType | null) => void
  addComponent: (component: PlacedComponent) => void
  removeComponent: (id: string) => void
  updateComponent: (id: string, updates: Partial<PlacedComponent>) => void
  addWire: (wire: Wire) => void
  removeWire: (id: string) => void
  select: (id: string | null) => void
  clearAll: () => void
}

export const useCircuitStore = create<CircuitStore>((set) => ({
  components: [],
  wires: [],
  selectedId: null,
  mode: 'select',
  placingType: null,

  setMode: (mode) => set({ mode, placingType: mode === 'place' ? null : null }),
  setPlacingType: (type) => set({ placingType: type, mode: type ? 'place' : 'select' }),

  addComponent: (component) =>
    set((state) => ({
      components: [...state.components, component],
      mode: 'select',
      placingType: null,
    })),

  removeComponent: (id) =>
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      wires: state.wires.filter(
        (w) => w.from.componentId !== id && w.to.componentId !== id
      ),
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
    })),

  removeWire: (id) =>
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
    })),

  select: (id) => set({ selectedId: id }),

  clearAll: () =>
    set({
      components: [],
      wires: [],
      selectedId: null,
      mode: 'select',
      placingType: null,
    }),
}))
