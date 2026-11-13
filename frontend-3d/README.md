# ElectroLab 3D

ویرایشگر سه‌بعدی بردبورد + شبیه‌سازی DC با اتصال به API بک‌اند ElectroLab AI (ngspice).

## اجرا

```bash
# ترمینال ۱ — بک‌اند
uvicorn backend.app.main:app --reload --port 8000

# ترمینال ۲ — فرانت
cd frontend-3d
npm install
npm run dev
```

http://localhost:5173

بدون بک‌اند هم کار می‌کند (آفلاین).

## قابلیت‌ها

- بردبورد سه‌بعدی، درگ‌ودراپ، snap
- منبع ۵V، مقاومت، LED، خازن
- سیم‌کشی، چرخش، مدار نمونه
- نت‌لیست سازگار با بک‌اند
- POST /api/v1/simulations/ngspice
- ولتاژ گره‌ها + روشن شدن LED
- دانلود .cir

## میانبرها

W سیم · Esc انتخاب · R چرخش · Delete حذف

## env

`VITE_API_BASE` پیش‌فرض `http://localhost:8000`
