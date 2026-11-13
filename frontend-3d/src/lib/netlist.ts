/**
 * Build SPICE netlist compatible with ElectroLab backend
 * (R, C, L, V, I only — LED approximated as series resistance).
 */
import type { PlacedComponent, Wire } from '../types/circuit'
import { BOARD_COLS, getHoleNetId, holePosition } from './breadboard'

class UnionFind {
  parent = new Map<string, string>()
  find(x: string): string {
    if (!this.parent.has(x)) this.parent.set(x, x)
    const p = this.parent.get(x)!
    if (p !== x) {
      const root = this.find(p)
      this.parent.set(x, root)
      return root
    }
    return x
  }
  union(a: string, b: string) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent.set(ra, rb)
  }
}

function nearestHole(x: number, z: number): { col: number; row: number } | null {
  let best: { col: number; row: number; dist: number } | null = null
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < 10; row++) {
      const [hx, , hz] = holePosition(col, row)
      const dist = Math.hypot(x - hx, z - hz)
      if (!best || dist < best.dist) best = { col, row, dist }
    }
  }
  if (!best || best.dist > 0.4) return null
  return { col: best.col, row: best.row }
}

function pinHoles(comp: PlacedComponent): { pinId: string; holeNet: string }[] {
  const center = nearestHole(comp.position[0], comp.position[2])
  if (!center) return []
  const results: { pinId: string; holeNet: string }[] = []
  const row = center.row
  if (comp.type === 'resistor' || comp.type === 'capacitor') {
    const colA = Math.max(0, center.col - 1)
    const colB = Math.min(BOARD_COLS - 1, center.col + 1)
    results.push({ pinId: 'a', holeNet: getHoleNetId(colA, row) })
    results.push({ pinId: 'b', holeNet: getHoleNetId(colB, row) })
  } else if (comp.type === 'led') {
    const colA = Math.max(0, center.col)
    const colC = Math.min(BOARD_COLS - 1, center.col + 1)
    results.push({ pinId: 'anode', holeNet: getHoleNetId(colA, row) })
    results.push({ pinId: 'cathode', holeNet: getHoleNetId(colC, row) })
  } else if (comp.type === 'power') {
    const colP = center.col
    const colN = Math.min(BOARD_COLS - 1, center.col + 2)
    results.push({ pinId: 'pos', holeNet: getHoleNetId(colP, row) })
    results.push({ pinId: 'neg', holeNet: getHoleNetId(colN, row) })
  }
  return results
}

function parseHoleId(id: string): { col: number; row: number } | null {
  const m = /^h-(\d+)-(\d+)$/.exec(id)
  if (!m) return null
  return { col: Number(m[1]), row: Number(m[2]) }
}

export type BuildResult = {
  netlist: string
  pinMap: Map<string, string>
  ledNodePairs: { id: string; anode: string; cathode: string }[]
}

export function buildNetlist(components: PlacedComponent[], wires: Wire[]): BuildResult {
  const uf = new UnionFind()
  for (const w of wires) {
    const a = parseHoleId(w.fromHoleId)
    const b = parseHoleId(w.toHoleId)
    if (a && b) uf.union(getHoleNetId(a.col, a.row), getHoleNetId(b.col, b.row))
  }

  type PinAssign = { compId: string; pinId: string; net: string }
  const assigns: PinAssign[] = []
  for (const c of components) {
    for (const ph of pinHoles(c)) {
      assigns.push({ compId: c.id, pinId: ph.pinId, net: uf.find(ph.holeNet) })
    }
  }

  const rootToNode = new Map<string, string>()
  let nCounter = 1
  const nodeName = (root: string) => {
    const r = uf.find(root)
    if (!rootToNode.has(r)) rootToNode.set(r, `n${nCounter++}`)
    return rootToNode.get(r)!
  }

  const power = components.find((c) => c.type === 'power')
  if (power) {
    const neg = assigns.find((a) => a.compId === power.id && a.pinId === 'neg')
    if (neg) rootToNode.set(uf.find(neg.net), '0')
  }

  const pinMap = new Map<string, string>()
  for (const a of assigns) pinMap.set(`${a.compId}:${a.pinId}`, nodeName(a.net))

  const lines: string[] = ['ElectroLab 3D circuit']
  let rIdx = 1
  let vIdx = 1
  let cIdx = 1
  const ledNodePairs: { id: string; anode: string; cathode: string }[] = []

  for (const c of components) {
    if (c.type === 'resistor') {
      const n1 = pinMap.get(`${c.id}:a`) ?? '0'
      const n2 = pinMap.get(`${c.id}:b`) ?? '0'
      const val = String(c.props.value || '1k').replace(/\s/g, '')
      lines.push(`R${rIdx++} ${n1} ${n2} ${val}`)
    } else if (c.type === 'led') {
      const na = pinMap.get(`${c.id}:anode`) ?? '0'
      const nc = pinMap.get(`${c.id}:cathode`) ?? '0'
      lines.push(`RLED${rIdx++} ${na} ${nc} 150`)
      ledNodePairs.push({ id: c.id, anode: na, cathode: nc })
    } else if (c.type === 'power') {
      const np = pinMap.get(`${c.id}:pos`) ?? 'n1'
      const nn = pinMap.get(`${c.id}:neg`) ?? '0'
      lines.push(`V${vIdx++} ${np} ${nn} DC ${Number(c.props.voltage || 5)}`)
    } else if (c.type === 'capacitor') {
      const n1 = pinMap.get(`${c.id}:a`) ?? '0'
      const n2 = pinMap.get(`${c.id}:b`) ?? '0'
      const val = String(c.props.value || '100n').replace(/\s/g, '')
      lines.push(`C${cIdx++} ${n1} ${n2} ${val}`)
    }
  }

  lines.push('.op', '.end')
  return { netlist: lines.join('\n') + '\n', pinMap, ledNodePairs }
}

function voltageAt(nodes: Record<string, number>, name: string): number {
  if (name === '0' || name === 'gnd' || name === 'GND') return 0
  if (nodes[name] !== undefined) return nodes[name]
  const lower = name.toLowerCase()
  for (const [k, v] of Object.entries(nodes)) {
    if (k.toLowerCase() === lower) return v
  }
  return 0
}

export function ledStatesFromVoltages(
  ledNodePairs: { id: string; anode: string; cathode: string }[],
  nodeVoltages: Record<string, number>
): Record<string, boolean> {
  const states: Record<string, boolean> = {}
  for (const led of ledNodePairs) {
    const va = voltageAt(nodeVoltages, led.anode)
    const vc = voltageAt(nodeVoltages, led.cathode)
    states[led.id] = va - vc > 1.5
  }
  return states
}

export function localEstimate(components: PlacedComponent[], wires: Wire[]) {
  const { netlist, pinMap, ledNodePairs } = buildNetlist(components, wires)
  const hasPower = components.some((c) => c.type === 'power')
  const ledStates: Record<string, boolean> = {}
  if (!hasPower) {
    for (const led of ledNodePairs) ledStates[led.id] = false
    return {
      ledStates,
      message: 'منبع تغذیه وجود ندارد — LEDها خاموش هستند.',
      netlist,
      nodeVoltages: {} as Record<string, number>,
      fromBackend: false,
    }
  }
  for (const led of ledNodePairs) {
    const a = pinMap.get(`${led.id}:anode`)
    const c = pinMap.get(`${led.id}:cathode`)
    ledStates[led.id] = Boolean(a && c && a !== c)
  }
  const litCount = Object.values(ledStates).filter(Boolean).length
  return {
    ledStates,
    message: litCount
      ? `شبیه‌سازی محلی: ${litCount} LED روشن (تخمینی).`
      : 'شبیه‌سازی محلی: LED روشنی تشخیص داده نشد. سیم‌کشی را بررسی کنید.',
    netlist,
    nodeVoltages: {} as Record<string, number>,
    fromBackend: false,
  }
}

const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  'http://localhost:8000'

export async function runSimulation(components: PlacedComponent[], wires: Wire[]) {
  const { netlist, ledNodePairs } = buildNetlist(components, wires)
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(`${API_BASE}/api/v1/simulations/ngspice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ netlist, timeout_seconds: 10 }),
      signal: controller.signal,
    })
    clearTimeout(t)
    if (res.ok) {
      const data = await res.json()
      const nodeVoltages: Record<string, number> = data.node_voltages || {}
      const ledStates = ledStatesFromVoltages(ledNodePairs, nodeVoltages)
      const litCount = Object.values(ledStates).filter(Boolean).length
      return {
        ok: data.status === 'COMPLETED',
        message:
          data.status === 'COMPLETED'
            ? `ngspice: ${data.message} — ${litCount} LED روشن (${data.elapsed_ms}ms)`
            : `ngspice خطا: ${data.message}`,
        ledStates,
        netlist,
        nodeVoltages,
        fromBackend: true,
      }
    }
    const detail = await res.text().catch(() => '')
    const local = localEstimate(components, wires)
    return { ...local, message: `API ${res.status} — ${local.message} (${detail.slice(0, 80)})` }
  } catch {
    return localEstimate(components, wires)
  }
}

export async function checkNgspiceStatus(): Promise<{
  available: boolean
  details: string
  version?: string
}> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/simulators/ngspice`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return { available: false, details: 'پاسخ نامعتبر از سرور' }
    const data = await res.json()
    return {
      available: Boolean(data.available),
      details: data.details || '',
      version: data.version,
    }
  } catch {
    return { available: false, details: 'سرور بک‌اند در دسترس نیست (آفلاین)' }
  }
}
