import { useState } from 'react'

export function HelpPanel() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 z-30 text-xs px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-600 text-slate-300 hover:text-white shadow-lg"
      >
        راهنما ؟
      </button>
    )
  }
  return (
    <div className="absolute top-4 right-4 z-30 w-[320px] max-h-[80vh] overflow-auto bg-slate-950/95 border border-slate-600 rounded-xl shadow-2xl text-xs text-slate-300">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 sticky top-0 bg-slate-950">
        <span className="text-cyan-300 font-medium">راهنمای سریع ElectroLab</span>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white px-1">
          ✕
        </button>
      </div>
      <div className="p-3 space-y-3 leading-relaxed">
        <section>
          <h3 className="text-white text-sm mb-1">مدار آنالوگ</h3>
          <p className="text-slate-400">قطعه → سیم (W) → شبیه‌سازی → اسکوپ / مولتی‌متر</p>
        </section>
        <section>
          <h3 className="text-white text-sm mb-1">MCU و C++</h3>
          <p className="text-slate-400">
            آزمایشگاه Arduino / ESP / Pico / STM32 یا اسکچ C++ · کلیک پین هدر → کلیک LED
          </p>
        </section>
        <section>
          <h3 className="text-white text-sm mb-1">میانبر</h3>
          <p className="text-slate-400">W سیم · P پروب · R چرخش · Del حذف</p>
        </section>
      </div>
    </div>
  )
}
