# ElectroLab 3D

شبیه‌ساز سه‌بعدی آزمایشگاه الکترونیک با قابلیت درگ‌ودراپ قطعات روی بردبورد.

## تکنولوژی‌ها

- React 18 + TypeScript
- Vite
- React Three Fiber + Drei
- Zustand (state management)
- Tailwind CSS

## راه‌اندازی

```bash
cd frontend-3d
npm install
npm run dev
```

سپس مرورگر را روی `http://localhost:5173` باز کنید.

## ساختار پوشه‌ها

```
src/
├── components/
│   ├── Breadboard.tsx
│   ├── Scene.tsx
│   ├── Toolbar.tsx
│   ├── Draggable.tsx
│   └── components/
│       ├── Resistor.tsx
│       └── LED.tsx
├── store/
│   └── circuitStore.ts
├── lib/
│   └── breadboard.ts
├── types/
│   └── circuit.ts
├── App.tsx
├── main.tsx
└── index.css
```

## وضعیت فعلی

- [x] بردبورد سه‌بعدی با سوراخ‌ها
- [x] دوربین قابل چرخش و زوم
- [x] افزودن مقاومت و LED
- [x] انتخاب و حذف قطعات
- [x] درگ‌ودراپ واقعی + snap به نزدیک‌ترین سوراخ
- [ ] سیستم سیم‌کشی
- [ ] تولید نت‌لیست SPICE
- [ ] اتصال به بک‌اند FastAPI / ngspice
- [ ] قطعات بیشتر

## قدم‌های بعدی

1. سیستم کشیدن سیم بین پایه‌ها
2. تولید نت‌لیست و ارسال به API شبیه‌سازی
3. بازخورد بصری نتایج شبیه‌سازی
4. چرخش قطعات
