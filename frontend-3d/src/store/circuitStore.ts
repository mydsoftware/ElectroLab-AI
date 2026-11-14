import { create } from 'zustand'
import type { AppMode, CircuitState, PlacedComponent, SimResult, Wire } from '../types/circuit'
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
  setScopeData: (d: CircuitState['scopeData']) => void
  setScopeCh1: (holeId: string | null) => void
  setScopeCh2: (holeId: string | null) => void
  setProbeAssign: (ch: 'ch1' | 'ch2') => void
  setMcuAssignPin: (pin: number | null) => void
  assignMcuPinToComponent: (componentId: string) => void
  setPinHoverLabel: (label: string | null) => void
  applyLedStates: (states: Record<string, boolean>) => void
  loadDemo: () => void
  loadDemoAc: () => void
  loadBridgeDemo: () => void
  loadMcuBlinkDemo: () => void
  loadEspBlinkDemo: () => void
  loadPicoBlinkDemo: () => void
  loadStmBlinkDemo: () => void
  loadProjectData: (data: {
    components: PlacedComponent[]
    wires: Wire[]
    scopeCh1?: string | null
    scopeCh2?: string | null
  }) => void
}

function lift(pos: [number, number, number]): [number, number, number] {
  return [pos[0], pos[1] + 0.05, pos[2]]
}

const emptyExtra = {
  scopeData: null as CircuitState['scopeData'],
  scopeCh1: null as string | null,
  scopeCh2: null as string | null,
  probeAssign: 'ch1' as const,
  mcuAssignPin: null as number | null,
  pinHoverLabel: null as string | null,
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  components: [],
  wires: [],
  selectedId: null,
  mode: 'select',
  wireStartHoleId: null,
  simulating: false,
  lastSim: null,
  ...emptyExtra,

  setMode: (mode) => set({ mode, wireStartHoleId: null }),
  addComponent: (component) =>
    set((s) => ({ components: [...s.components, component], selectedId: component.id })),
  removeComponent: (id) =>
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),
  updateComponent: (id, updates) =>
    set((s) => ({
      components: s.components.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  rotateSelected: () => {
    const { selectedId, components } = get()
    if (!selectedId) return
    set({
      components: components.map((c) => {
        if (c.id !== selectedId) return c
        const y = (c.rotation[1] + Math.PI / 2) % (Math.PI * 2)
        return { ...c, rotation: [c.rotation[0], y, c.rotation[2]] as [number, number, number] }
      }),
    })
  },
  addWire: (wire) => set((s) => ({ wires: [...s.wires, wire], wireStartHoleId: null })),
  removeWire: (id) => set((s) => ({ wires: s.wires.filter((w) => w.id !== id) })),
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
      ...emptyExtra,
    }),
  setSimulating: (v) => set({ simulating: v }),
  setLastSim: (r) => set({ lastSim: r }),
  setScopeData: (d) => set({ scopeData: d }),
  setScopeCh1: (holeId) => set({ scopeCh1: holeId }),
  setScopeCh2: (holeId) => set({ scopeCh2: holeId }),
  setProbeAssign: (ch) => set({ probeAssign: ch }),
  setMcuAssignPin: (pin) => set({ mcuAssignPin: pin }),
  setPinHoverLabel: (label) => set({ pinHoverLabel: label }),
  assignMcuPinToComponent: (componentId) => {
    const { mcuAssignPin, components } = get()
    if (mcuAssignPin === null) return
    set({
      components: components.map((c) => {
        if (c.id !== componentId) return c
        if (c.type !== 'led' && c.type !== 'button' && c.type !== 'potentiometer') return c
        return { ...c, props: { ...c.props, arduinoPin: mcuAssignPin } }
      }),
      mcuAssignPin: null,
      selectedId: componentId,
    })
  },
  applyLedStates: (states) =>
    set((s) => ({
      components: s.components.map((c) => {
        if (c.type !== 'led') return c
        const lit = states[c.id]
        if (lit === undefined) return c
        return { ...c, props: { ...c.props, lit } }
      }),
    })),
  loadProjectData: (data) =>
    set({
      components: data.components || [],
      wires: data.wires || [],
      selectedId: null,
      mode: 'select',
      wireStartHoleId: null,
      lastSim: null,
      scopeData: null,
      scopeCh1: data.scopeCh1 ?? null,
      scopeCh2: data.scopeCh2 ?? null,
      probeAssign: 'ch1',
      mcuAssignPin: null,
      pinHoverLabel: null,
    }),
  loadDemo: () => {
    set({
      components: [
        { id: 'power-demo', type: 'power', position: holePosition(5, 2), rotation: [0,0,0], props: { voltage: 5 },
          pins: [{ id: 'pos', position: [-0.15,0.02,0] }, { id: 'neg', position: [0.15,0.02,0] }] },
        { id: 'resistor-demo', type: 'resistor', position: holePosition(12, 2), rotation: [0,0,0], props: { value: '330' },
          pins: [{ id: 'a', position: [-0.35,0.05,0] }, { id: 'b', position: [0.35,0.05,0] }] },
        { id: 'led-demo', type: 'led', position: holePosition(18, 2), rotation: [0,0,0], props: { color: '#e74c3c', lit: false },
          pins: [{ id: 'anode', position: [0.05,-0.05,0] }, { id: 'cathode', position: [-0.05,0,0] }] },
      ],
      wires: [
        { id: 'w1', fromHoleId: 'h-5-2', toHoleId: 'h-11-2', fromPos: lift(holePosition(5,2)), toPos: lift(holePosition(11,2)), color: '#e74c3c' },
        { id: 'w2', fromHoleId: 'h-13-2', toHoleId: 'h-18-2', fromPos: lift(holePosition(13,2)), toPos: lift(holePosition(18,2)), color: '#3498db' },
        { id: 'w3', fromHoleId: 'h-19-2', toHoleId: 'h-7-2', fromPos: lift(holePosition(19,2)), toPos: lift(holePosition(7,2)), color: '#2ecc71' },
      ],
      selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null, ...emptyExtra,
    })
  },
  loadDemoAc: () => {
    set({
      components: [
        { id: 'ac-demo', type: 'acsource', position: holePosition(4, 3), rotation: [0,0,0],
          props: { amplitude: 5, frequency: 50, wave: 'sine', ac: true },
          pins: [{ id: 'pos', position: [-0.15,0.02,0] }, { id: 'neg', position: [0.15,0.02,0] }] },
        { id: 'res-ac', type: 'resistor', position: holePosition(12, 3), rotation: [0,0,0], props: { value: '1k' },
          pins: [{ id: 'a', position: [-0.35,0.05,0] }, { id: 'b', position: [0.35,0.05,0] }] },
        { id: 'cap-ac', type: 'capacitor', position: holePosition(18, 5), rotation: [0,0,0], props: { value: '10u' },
          pins: [{ id: 'a', position: [-0.2,0.05,0] }, { id: 'b', position: [0.2,0.05,0] }] },
      ],
      wires: [
        { id: 'wa1', fromHoleId: 'h-4-3', toHoleId: 'h-11-3', fromPos: lift(holePosition(4,3)), toPos: lift(holePosition(11,3)), color: '#a78bfa' },
        { id: 'wa2', fromHoleId: 'h-13-3', toHoleId: 'h-18-3', fromPos: lift(holePosition(13,3)), toPos: lift(holePosition(18,3)), color: '#22d3ee' },
      ],
      selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null,
      scopeData: null, scopeCh1: 'h-18-3', scopeCh2: 'h-6-5', probeAssign: 'ch1', mcuAssignPin: null, pinHoverLabel: null,
    })
  },
  loadBridgeDemo: () => get().loadDemoAc(),
  loadMcuBlinkDemo: () => {
    set({
      components: [
        { id: 'mcu-board', type: 'module', position: holePosition(3, 8), rotation: [0,0,0],
          catalogId: 'board-arduino-uno', label: 'Arduino Uno',
          props: { label: 'Arduino Uno', accent: '#00979d' },
          pins: [{ id: '1', position: [-0.25,0,-0.22] }, { id: '2', position: [0.25,0,-0.22] }] },
        { id: 'led-mcu', type: 'led', position: holePosition(18, 3), rotation: [0,0,0],
          props: { color: '#e74c3c', lit: false, arduinoPin: 13 },
          pins: [{ id: 'anode', position: [0.05,-0.05,0] }, { id: 'cathode', position: [-0.05,0,0] }] },
      ],
      wires: [], selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null, ...emptyExtra,
    })
  },
  loadEspBlinkDemo: () => {
    set({
      components: [
        { id: 'esp-board', type: 'module', position: holePosition(3, 8), rotation: [0,0,0],
          catalogId: 'board-esp32-devkit', label: 'ESP32 DevKit',
          props: { label: 'ESP32', accent: '#1e40af' },
          pins: [{ id: '1', position: [-0.25,0,-0.22] }, { id: '2', position: [0.25,0,-0.22] }] },
        { id: 'led-esp', type: 'led', position: holePosition(18, 3), rotation: [0,0,0],
          props: { color: '#22d3ee', lit: false, arduinoPin: 2 },
          pins: [{ id: 'anode', position: [0.05,-0.05,0] }, { id: 'cathode', position: [-0.05,0,0] }] },
      ],
      wires: [], selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null, ...emptyExtra,
    })
  },
  loadPicoBlinkDemo: () => {
    set({
      components: [
        { id: 'pico-board', type: 'module', position: holePosition(4, 7), rotation: [0,0,0],
          catalogId: 'board-pico', label: 'Raspberry Pi Pico',
          props: { label: 'Pico', accent: '#16a34a' },
          pins: [{ id: '1', position: [-0.2,0,-0.3] }, { id: '2', position: [0.2,0,-0.3] }] },
        { id: 'led-pico', type: 'led', position: holePosition(18, 3), rotation: [0,0,0],
          props: { color: '#4ade80', lit: false, arduinoPin: 25 },
          pins: [{ id: 'anode', position: [0.05,-0.05,0] }, { id: 'cathode', position: [-0.05,0,0] }] },
      ],
      wires: [], selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null, ...emptyExtra,
    })
  },
  loadStmBlinkDemo: () => {
    set({
      components: [
        { id: 'stm-board', type: 'module', position: holePosition(4, 7), rotation: [0,0,0],
          catalogId: 'board-stm32-bluepill', label: 'STM32 Blue Pill',
          props: { label: 'STM32', accent: '#0ea5e9' },
          pins: [{ id: '1', position: [-0.2,0,-0.3] }, { id: '2', position: [0.2,0,-0.3] }] },
        { id: 'led-stm', type: 'led', position: holePosition(18, 3), rotation: [0,0,0],
          props: { color: '#38bdf8', lit: false, arduinoPin: 13 },
          pins: [{ id: 'anode', position: [0.05,-0.05,0] }, { id: 'cathode', position: [-0.05,0,0] }] },
      ],
      wires: [], selectedId: null, mode: 'select', wireStartHoleId: null, lastSim: null, ...emptyExtra,
    })
  },
}))
