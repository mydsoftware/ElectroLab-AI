import { createContext, SKETCHES, type SketchContext, type SketchDefinition } from './sketches'

export type McuRuntimeState = {
  running: boolean
  sketchId: string | null
  millis: number
  pins: Record<number, { mode: string; value: 0 | 1; analog?: number }>
  logs: string[]
}

type Listener = (state: McuRuntimeState) => void

class McuRuntime {
  private ctx: SketchContext
  private sketch: SketchDefinition | null = null
  private running = false
  private raf = 0
  private lastTs = 0
  private logs: string[] = []
  private listeners = new Set<Listener>()

  constructor() {
    this.ctx = createContext((msg) => this.pushLog(msg))
  }

  private pushLog(msg: string) {
    this.logs = [...this.logs.slice(-40), `[${Math.floor(this.ctx.millis)}ms] ${msg}`]
    this.emit()
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    fn(this.snapshot())
    return () => this.listeners.delete(fn)
  }

  private emit() {
    const snap = this.snapshot()
    this.listeners.forEach((fn) => fn(snap))
  }

  snapshot(): McuRuntimeState {
    const pins: McuRuntimeState['pins'] = {}
    for (const [k, v] of Object.entries(this.ctx.pins)) {
      pins[Number(k)] = { mode: v.mode, value: v.value, analog: v.analog }
    }
    return {
      running: this.running,
      sketchId: this.sketch?.id ?? null,
      millis: this.ctx.millis,
      pins,
      logs: this.logs,
    }
  }

  listSketches() {
    return SKETCHES
  }

  loadSketch(id: string) {
    const s = SKETCHES.find((x) => x.id === id)
    if (!s) return
    this.stop()
    this.sketch = s
    this.ctx = createContext((msg) => this.pushLog(msg))
    this.logs = []
    s.setup(this.ctx)
    this.pushLog(`بارگذاری: ${s.name_fa}`)
    this.emit()
  }

  start() {
    if (!this.sketch) this.loadSketch('blink')
    if (this.running) return
    this.running = true
    this.lastTs = performance.now()
    this.pushLog('اجرا شروع شد')
    const tick = (ts: number) => {
      if (!this.running || !this.sketch) return
      const dt = Math.min(50, ts - this.lastTs)
      this.lastTs = ts
      this.ctx.millis += dt
      this.sketch.loop(this.ctx, dt)
      this.emit()
      this.raf = requestAnimationFrame(tick)
    }
    this.raf = requestAnimationFrame(tick)
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.emit()
  }

  reset() {
    const id = this.sketch?.id
    this.stop()
    if (id) this.loadSketch(id)
    else {
      this.ctx = createContext((msg) => this.pushLog(msg))
      this.logs = []
      this.emit()
    }
  }
}

export const mcuRuntime = new McuRuntime()
