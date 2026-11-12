/**
 * Build SPICE netlist from placed components + wires + breadboard nets.
 */
import type { PlacedComponent, Wire } from '../types/circuit'
import { BOARD_COLS, BOARD_ROWS, getHoleNetId, holePosition } from './breadboard'

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

function holeId(col: number, row: number) {
  return `h-${col}-${row}`
}

function nearestHole(x: number, z: number): { col: number; row: number } | null {
  let best: { col: number; row: number; dist: number } | null = null
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS; row++) {
      const [hx, , hz] = holePosition(col, row)
      const dist = Math.hypot(x - hx, z - hz)
      if (!best || dist < best.dist) best = { col, row, dist }
    }
  }
  if (!best || best.dist > 0.4) return null
  return { col: best.col, row: best.row }
}

function pinHoles(comp: PlacedComponent): { pinId: string; holeNet: string; holeId: string }[] {
  const center = nearestHole(comp.position[0], comp.position[2])
  if (!center) return []
  const results: { pinId: string; holeNet: string; holeId: string }[] = []
  const row = center.row

  if (comp.type === 'resistor') {
    const colA = Math.max(0, center.col - 1)
    const colB = Math.min(BOARD_COLS - 1, center.col + 1)
    results.push({ pinId: 'a', holeId: holeId(colA, row), holeNet: getHoleNetId(colA, row) })
    results.push({ pinId: 'b', holeId: holeId(colB, row), holeNet: getHoleNetId(colB, row) })
  } else if (comp.type === 'led') {
    const colA = Math.max(0, center.col)
    const colC = Math.min(BOARD_COLS - 1, center.col + 1)
    results.push({ pinId: 'anode', holeId: holeId(colA, row), holeNet: getHoleNetId(colA, row) })
    results.push({ pinId: 'cathode', holeId: holeId(colC, row), holeNet: getHoleNetId(colC, row) })
  } else if (comp.type === 'power') {
    const colP = center.col
    const colN = Math.min(BOARD_COLS - 1, center.col + 2)
    results.push({ pinId: 'pos', holeId: holeId(colP, row), holeNet: getHoleNetId(colP, row) })
    results.push({ pinId: 'neg', holeId: holeId(colN, row), holeNet: getHoleNetId(colN, row) })
  } else if (comp.type === 'capacitor') {
    const colA = Math.max(0, center.col - 1)
    const colB = Math.min(BOARD_COLS - 1, center.col + 1)
    results.push({ pinId: 'a', holeId: holeId(colA, row), holeNet: getHoleNetId(colA, row) })
    results.push({ pinId: 'b', holeId: holeId(colB, row), holeNet: getHoleNetId(colB, row) })
  }
  return results
}

function parseHoleId(id: string): { col: number; row: number } | null {
  const m = /^h-(\d+)-(\d+)$/.exec(id)
  if (!m) return null
  return { col: Number(m[1]), row: Number(m[2]) }
}

export function buildNetlist(components: PlacedComponent[], wires: Wire[]) {
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

  let groundNode = '0'
  const power = components.find((c) => c.type === 'power')
  if (power) {
    const neg = assigns.find((a) => a.compId === power.id && a.pinId === 'neg')
    if (neg) {
      rootToNode.set(uf.find(neg.net), '0')
      groundNode = '0'
    }
  }

  const pinMap = new Map<string, string>()
  for (const a of assigns) pinMap.set(`${a.compId}:${a.pinId}`, nodeName(a.net))

  const lines: string[] = ['* ElectroLab 3D generated netlist', '.title electrolab']
  let rIdx = 1, dIdx = 1, vIdx = 1, cIdx = 1

  for (const c of components) {
    if (c.type === 'resistor') {
      const n1 = pinMap.get(`${c.id}:a`) ?? '0'
      const n2 = pinMap.get(`${c.id}:b`) ?? '0'
      lines.push(`R${rIdx++} ${n1} ${n2} ${String(c.props.value || '1k')}`)
    } else if (c.type === 'led') {
      const na = pinMap.get(`${c.id}:anode`) ?? '0'
      const nc = pinMap.get(`${c.id}:cathode`) ?? '0'
      lines.push(`D${dIdx++} ${na} ${nc} LEDMODEL`)
    } else if (c.type === 'power') {
      const np = pinMap.get(`${c.id}:pos`) ?? 'n1'
      const nn = pinMap.get(`${c.id}:neg`) ?? '0'
      lines.push(`V${vIdx++} ${np} ${nn} DC ${Number(c.props.voltage || 5)}`)
    } else if (c.type === 'capacitor') {
      const n1 = pinMap.get(`${c.id}:a`) ?? '0'
      const n2 = pinMap.get(`${c.id}:b`) ?? '0'
      lines.push(`C${cIdx++} ${n1} ${n2} ${String(c.props.value || '100n')}`)
    }
  }

  if (components.some((c) => c.type === 'led')) {
    lines.push('.model LEDMODEL D (IS=1e-20 N=1.8 RS=5 BV=5 IBV=1e-5)')
  }
  lines.push('.op', '.end')
  return { netlist: lines.join('\n'), pinMap, groundNode }
}

export function localEstimate(components: PlacedComponent[], wires: Wire[]) {
  const { netlist, pinMap } = buildNetlist(components, wires)
  const hasPower = components.some((c) => c.type === 'power')
  const leds = components.filter((c) => c.type === 'led')
  const ledStates: Record<string, boolean> = {}

  if (!hasPower) {
    for (const led of leds) ledStates[led.id] = false
    return { ledStates, message: 'منبع تغذیه وجود ندارد — LEDها خاموش هستند.', netlist }
  }

  for (const led of leds) {
    const a = pinMap.get(`${led.id}:anode`)
    const c = pinMap.get(`${led.id}:cathode`)
    ledStates[led.id] = Boolean(a && c && a !== c)
  }

  const litCount = Object.values(ledStates).filter(Boolean).length
  return {
    ledStates,
    message: litCount
      ? `شبیه‌سازی محلی: ${litCount} LED روشن (تخمینی). نت‌لیست آماده است.`
      : 'شبیه‌سازی محلی: هیچ LED روشنی تشخیص داده نشد.',
    netlist,
  }
}

export async function runSimulation(
  components: PlacedComponent[],
  wires: Wire[],
  apiBase = 'http://localhost:8000'
) {
  const { netlist } = buildNetlist(components, wires)
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const res = await fetch(`${apiBase}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ netlist }),
      signal: controller.signal,
    })
    clearTimeout(t)
    if (res.ok) {
      const data = await res.json()
      const local = localEstimate(components, wires)
      return {
        ok: true,
        message: data.message || 'شبیه‌سازی از طریق API انجام شد.',
        ledStates: data.ledStates || local.ledStates,
        netlist,
      }
    }
  } catch {
    /* offline */
  }
  const local = localEstimate(components, wires)
  return {
    ok: true,
    message: local.message + ' (حالت آفلاین)',
    ledStates: local.ledStates,
    netlist: local.netlist,
  }
}
