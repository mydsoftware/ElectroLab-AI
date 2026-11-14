interface Props {
  open: boolean
  onClose: () => void
}

/** Catalog drawer – full catalog data can be expanded later */
export function CatalogPanel({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="absolute inset-y-0 left-0 z-40 w-80 max-w-[90vw] bg-slate-950/95 border-r border-slate-700 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-cyan-300 font-medium text-sm">کاتالوگ</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white px-2">✕</button>
      </div>
      <div className="p-4 text-sm text-slate-400 leading-relaxed">
        قطعات اصلی از نوار ابزار سمت راست در دسترس‌اند (منبع، R، C، LED، AC، سلف، دیود،
        GND، دکمه، پتانسیومتر، ترانزیستور و بردهای Arduino / ESP / Pico / STM32).
      </div>
    </div>
  )
}
