# کاتالوگ قطعات ElectroLab

## آمار seed فعلی

- **۱۵۳ قطعه** در `components.json` (محلی) / `components_batch_*.json`
- **۳۲ دسته** در `categories.json`
- **۱۳ پلتفرم** در `platforms.json`

## انواع

| kind | تعداد تقریبی |
|------|-------------|
| discrete | ۵۷ |
| sensor | ۲۷ |
| module | ۲۲ |
| power | ۱۲ |
| board / mcu | ۱۵ |
| display | ۹ |
| connector | ۱۱ |

## پلتفرم‌ها

arduino-uno, arduino-nano, arduino-mega, atmega328p, atmega2560, attiny85, esp32, esp32-c3, esp8266, stm32-f1, rp2040, raspberry-pi, generic

## API

```
GET /api/v1/catalog/components?platform_id=arduino-uno
GET /api/v1/catalog/components?category_id=sensors&q=dht
```

فایل کامل seed در توسعه محلی: `catalog/components.json`
