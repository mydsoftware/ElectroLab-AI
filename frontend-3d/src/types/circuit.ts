export type ComponentType = 'resistor' | 'led' | 'capacitor' | 'power' | 'wire'

export interface Pin {
  id: string
  /** Local position relative to component center */
  position: [number, number, number]
  /** Connected breadboard hole id, if any */
  holeId?: string
}

export interface PlacedComponent {
  id: string
  type: ComponentType
  /** World position on the breadboard */
  position: [number, number, number]
  rotation: [number, number, number]
  /** Component-specific properties */
  props: Record<string, string | number>
  pins: Pin[]
}

export interface Wire {
  id: string
  from: { componentId: string; pinId: string }
  to: { componentId: string; pinId: string }
  points?: [number, number, number][]
  color: string
}

export interface BreadboardHole {
  id: string
  col: number
  row: number
  position: [number, number, number]
  netId: string
}

export interface CircuitState {
  components: PlacedComponent[]
  wires: Wire[]
  selectedId: string | null
  mode: 'select' | 'place' | 'wire'
  placingType: ComponentType | null
}
