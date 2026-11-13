/**
 * Arduino-C++ subset → executable sketch for ElectroLab MCU runtime.
 */
import type { SketchContext, SketchDefinition } from './sketches'

const PREAMBLE = `
const HIGH = 1, LOW = 0;
const INPUT = 'input', OUTPUT = 'output', INPUT_PULLUP = 'input_pullup';
const pinMode = (p,m) => ctx.pinMode(p, m === OUTPUT || m === 'OUTPUT' ? 'output' : m === INPUT_PULLUP || m === 'INPUT_PULLUP' ? 'input_pullup' : 'input');
const digitalWrite = (p,v) => ctx.digitalWrite(p, (v === HIGH || v === 1 || v === true || v === 'HIGH') ? 1 : 0);
const digitalRead = (p) => ctx.digitalRead(p);
const analogWrite = (p,v) => ctx.analogWrite(p, Number(v));
const millis = () => ctx.millis;
const delay = (ms) => { ctx.__waitUntil = ctx.millis + Number(ms); };
const log = (m) => ctx.log(String(m));
const Serial = { begin: () => {}, println: (m) => ctx.log(String(m)), print: (m) => ctx.log(String(m)) };
`

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '\n').replace(/\/\/.*$/gm, '')
}

function extractFunction(src: string, name: string): string | null {
  const re = new RegExp(`(?:void|int|bool)\\s+${name}\\s*\\(\\s*(?:void)?\\s*\\)\\s*\\{`, 'm')
  const m = re.exec(src)
  if (!m || m.index === undefined) return null
  let i = m.index + m[0].length
  let depth = 1
  const start = i
  while (i < src.length && depth > 0) {
    const c = src[i++]
    if (c === '{') depth++
    else if (c === '}') depth--
  }
  return src.slice(start, i - 1)
}

function cppBodyToJs(body: string): string {
  let s = body
  s = s.replace(/#define\\s+(\\w+)\\s+([^\n]+)/g, 'const $1 = $2;')
  s = s.replace(/\\b(?:unsigned\\s+)?(?:const\\s+)?(?:static\\s+)?(?:int|long|byte|bool|boolean|uint8_t|uint16_t|float|double|char|short)\\s+/g, 'let ')
  s = s.replace(/\\bconst\\s+let\\s+/g, 'const ')
  s = s.replace(/\\(\\s*(?:int|long|byte|bool|float)\\s*\\)/g, '')
  return s
}

export type CppCompileResult =
  | { ok: true; sketch: SketchDefinition }
  | { ok: false; error: string }

export function compileArduinoCpp(source: string): CppCompileResult {
  const stripped = stripComments(source)
  const setupBody = extractFunction(stripped, 'setup')
  const loopBody = extractFunction(stripped, 'loop')
  if (!setupBody && !loopBody) {
    return { ok: false, error: 'توابع setup() یا loop() پیدا نشد.' }
  }
  const setupJs = cppBodyToJs(setupBody || '')
  const loopJs = cppBodyToJs(loopBody || '')
  try {
    const setupFn = new Function('ctx', `'use strict';\n${PREAMBLE}\n${setupJs}`) as (
      ctx: SketchContext
    ) => void
    const loopFn = new Function(
      'ctx',
      'dtMs',
      `'use strict';\n${PREAMBLE}\nif (ctx.__waitUntil && ctx.millis < ctx.__waitUntil) return;\nctx.__waitUntil = 0;\n${loopJs}`
    ) as (ctx: SketchContext, dt: number) => void
    return {
      ok: true,
      sketch: {
        id: 'cpp',
        name_fa: 'اسکچ C++ آردوینو',
        name_en: 'Arduino C++',
        description_fa: 'کد C++ کاربر',
        setup(ctx) {
          ;(ctx as any).__waitUntil = 0
          try {
            setupFn(ctx)
            ctx.log('setup() انجام شد')
          } catch (e) {
            ctx.log('خطا setup: ' + (e instanceof Error ? e.message : String(e)))
          }
        },
        loop(ctx, dt) {
          try {
            loopFn(ctx, dt)
          } catch (e) {
            ctx.log('خطا loop: ' + (e instanceof Error ? e.message : String(e)))
          }
        },
      },
    }
  } catch (e) {
    return { ok: false, error: 'خطای تبدیل C++: ' + (e instanceof Error ? e.message : String(e)) }
  }
}

export const DEFAULT_ARDUINO_CPP = `/*
 * ElectroLab — اسکچ نمونه آردوینو (C++)
 */

#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("ElectroLab MCU ready");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
`

export const EXAMPLES = [
  { id: 'blink-cpp', name_fa: 'Blink C++', code: DEFAULT_ARDUINO_CPP },
  {
    id: 'button-cpp',
    name_fa: 'دکمه و LED',
    code: `void setup() {\n  pinMode(2, INPUT_PULLUP);\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  int st = digitalRead(2);\n  digitalWrite(13, st);\n}\n`,
  },
]
