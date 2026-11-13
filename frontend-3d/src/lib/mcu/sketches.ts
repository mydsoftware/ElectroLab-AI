export type PinMode = 'input' | 'output' | 'input_pullup'

export type McuPinState = {
  mode: PinMode
  value: 0 | 1
  analog?: number
}

export type SketchContext = {
  millis: number
  pins: Record<number, McuPinState>
  digitalWrite: (pin: number, v: 0 | 1) => void
  pinMode: (pin: number, mode: PinMode) => void
  analogWrite: (pin: number, v: number) => void
  log: (msg: string) => void
}

export type SketchDefinition = {
  id: string
  name_fa: string
  name_en: string
  description_fa: string
  setup: (ctx: SketchContext) => void
  loop: (ctx: SketchContext, dtMs: number) => void
}

function ensurePin(ctx: SketchContext, pin: number) {
  if (!ctx.pins[pin]) ctx.pins[pin] = { mode: 'input', value: 0 }
}

export const SKETCHES: SketchDefinition[] = [
  {
    id: 'blink',
    name_fa: 'چشمک LED (Blink)',
    name_en: 'Blink',
    description_fa: 'پایه ۱۳ را هر ۵۰۰ms روشن/خاموش می‌کند.',
    setup(ctx) {
      ctx.pinMode(13, 'output')
      ctx.digitalWrite(13, 0)
      ctx.log('Blink: pin 13 output')
    },
    loop(ctx) {
      const on = Math.floor(ctx.millis / 500) % 2 === 0
      ctx.digitalWrite(13, on ? 1 : 0)
    },
  },
  {
    id: 'blink-fast',
    name_fa: 'چشمک سریع',
    name_en: 'Fast Blink',
    description_fa: 'چشمک ۲۰۰ms روی پایه ۱۳.',
    setup(ctx) {
      ctx.pinMode(13, 'output')
    },
    loop(ctx) {
      ctx.digitalWrite(13, Math.floor(ctx.millis / 200) % 2 === 0 ? 1 : 0)
    },
  },
  {
    id: 'pwm-fade',
    name_fa: 'محو شدن PWM',
    name_en: 'PWM Fade',
    description_fa: 'پایه ۹ با PWM رفت‌وبرگشتی.',
    setup(ctx) {
      ctx.pinMode(9, 'output')
    },
    loop(ctx) {
      const t = (ctx.millis % 2000) / 2000
      const v = t < 0.5 ? t * 2 : (1 - t) * 2
      ctx.analogWrite(9, Math.round(v * 255))
      ctx.digitalWrite(9, v > 0.1 ? 1 : 0)
    },
  },
  {
    id: 'binary-counter',
    name_fa: 'شمارنده باینری',
    name_en: 'Binary Counter',
    description_fa: 'پایه‌های ۸ تا ۱۱ شمارنده باینری.',
    setup(ctx) {
      for (const p of [8, 9, 10, 11]) ctx.pinMode(p, 'output')
    },
    loop(ctx) {
      const n = Math.floor(ctx.millis / 300) % 16
      for (let i = 0; i < 4; i++) ctx.digitalWrite(8 + i, (n >> i) & 1 ? 1 : 0)
    },
  },
  {
    id: 'knight-rider',
    name_fa: 'نور متحرک',
    name_en: 'Knight Rider',
    description_fa: 'LED روشن بین پایه‌های ۸–۱۲ جابه‌جا می‌شود.',
    setup(ctx) {
      for (const p of [8, 9, 10, 11, 12]) ctx.pinMode(p, 'output')
    },
    loop(ctx) {
      const pins = [8, 9, 10, 11, 12]
      const cycle = pins.length * 2 - 2
      let i = Math.floor(ctx.millis / 150) % cycle
      if (i >= pins.length) i = cycle - i
      for (let p = 0; p < pins.length; p++) ctx.digitalWrite(pins[p], p === i ? 1 : 0)
    },
  },
]

export function createContext(log: (msg: string) => void): SketchContext {
  const pins: Record<number, McuPinState> = {}
  const ctx: SketchContext = {
    millis: 0,
    pins,
    pinMode(pin, mode) {
      ensurePin(ctx, pin)
      ctx.pins[pin].mode = mode
    },
    digitalWrite(pin, v) {
      ensurePin(ctx, pin)
      ctx.pins[pin].value = v ? 1 : 0
      if (ctx.pins[pin].analog === undefined) ctx.pins[pin].analog = v ? 255 : 0
    },
    analogWrite(pin, v) {
      ensurePin(ctx, pin)
      const clamped = Math.max(0, Math.min(255, v))
      ctx.pins[pin].analog = clamped
      ctx.pins[pin].value = clamped > 127 ? 1 : 0
    },
    log,
  }
  return ctx
}
