# راه‌اندازی موتور شبیه‌سازی ngspice

## اجرای محلی با Docker

از ریشه مخزن اجرا کنید:

```bash
docker compose up --build
```

سرویس API روی `http://localhost:8000` در دسترس است. مستندات تعاملی API در `http://localhost:8000/docs` قرار دارد.

## اجرای مستقیم

1. Python 3.12 و ngspice را نصب کنید.
2. وابستگی‌ها را نصب کنید: `pip install -r requirements-dev.txt`
3. سرور را اجرا کنید: `uvicorn backend.app.main:app --reload`
4. وضعیت موتور: `GET /api/v1/simulators/ngspice`
5. اجرای مدار: `POST /api/v1/simulations/ngspice`

نمونه درخواست:

```json
{
  "netlist": "مدار تست DC\\nV1 in 0 DC 5\\nR1 in 0 1k\\n.op\\n.end",
  "timeout_seconds": 10
}
```

## محدودیت امنیتی MVP

برای جلوگیری از اجرای فرمان‌ها و دسترسی فایل از داخل نت‌لیست، فقط عناصر پایه R/C/L/V/I و دستورهای `.op` و `.end` مجاز هستند. دستورهای `.control`، `.include`، `.shell`، تحلیل گذرا و مدل‌های خارجی رد می‌شوند. اجرای موتور در پوشه موقت، با timeout و بدون shell انجام می‌شود.

این نسخه فقط تحلیل نقطه‌کار DC پایه را هدف می‌گیرد؛ هنوز شبیه‌سازی میکروکنترلر، تحلیل گذرا، PCB، ارتباط USB و تست سخت‌افزار واقعی پیاده‌سازی نشده‌اند.
