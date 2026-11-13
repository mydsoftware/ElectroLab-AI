# کاتالوگ قطعات ElectroLab

هر قطعه شامل:

- **کاربرد فارسی** (`description_fa` / `usage_fa`)
- **لینک دیتاشیت** (`datasheet_url`)
- دسته، پلتفرم سازگار، پایه‌ها و تگ‌ها

## آمار

- ۱۵۳ قطعه با کاربرد و دیتاشیت
- ۳۲ دسته
- ۱۳ پلتفرم (Arduino، ATmega، ESP، STM32، Pico، …)

## نمونه API

```
GET /api/v1/catalog/components?q=dht
GET /api/v1/catalog/components?platform_id=arduino-uno
```

فایل کامل seed: `catalog/components.json`
