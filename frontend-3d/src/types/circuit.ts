export type ComponentType = 'resistor' | 'led' | 'capacitor' | 'power'

export interface Pin {
  id: string
  position: [number, number, number]
  holeId?: string
  col?: number
  row?: number
}

export interface PlacedComponent {
  id: string
  type: ComponentType
  position: [number, number, number]
  rotation: [number, number, number]
  props: Record<string, string | number | boolean>
  pins: Pin[]
}

export interface Wire {
  id: string
  fromHoleId: string
  toHoleId: string
  fromPos: [number, number, number]
  toPos: [number, number, number]
  color: string
}

export interface BreadboardHole {
  id: string
  col: number
  row: number
  position: [number, number, number]
  netId: string
}

export type AppMode = 'select' | 'wire'

export interface SimResult {
  ok: boolean
  message: string
  nodeVoltages?: Record<string, number>
  ledStates?: Record<string, boolean>
  netlist?: string
}

export interface CircuitState {
  components: PlacedComponent[]
  wires: Wire[]
  selectedId: string | null
  mode: AppMode
  wireStartHoleId: string | null
  simulating: boolean
  lastSim: SimResult | null
}
