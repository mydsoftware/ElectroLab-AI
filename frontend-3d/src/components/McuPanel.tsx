import { useState } from 'react'

/** MCU panel placeholder – C++ runtime can be expanded */
export function McuPanel() {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-20 left-4 z-20 text-[11px] px-2 py-1 rounded-lg bg-indigo-900/80 border border-indigo-700 text-indigo-200"
      >
        MCU / C++
      </button>
    )
  }
  return (
    <div className="absolute top-16 left-4 z-20 w-[300px] bg-slate-950/95 border border-indigo-800 rounded-xl shadow-xl text-xs text-slate-300 p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-indigo-300 font-medium">شبیه‌ساز MCU</span>
        <button onClick={() => setOpen(false)} className="text-slate-500">✕</button>
      </div>
      <p className="leading-relaxed text-slate-400">
        بردها را از بخش «بردها / MCU» در نوار ابزار اضافه کنید. اسکچ C++ کامل در به‌روزرسانی بعدی
        همگام می‌شود.
      </p>
    </div>
  )
}
