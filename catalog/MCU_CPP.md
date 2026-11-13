# توسعه با C++ آردوینو در ElectroLab

## نحوه کار

پنل **MCU · توسعه C++** → تب **C++ آردوینو** → نوشتن `setup` / `loop` → **کامپایل و اجرای C++**

این یک **زیرمجموعه آموزشی** است (نه gcc کامل). برای نمونه‌سازی آزمایشگاه و یادگیری کافی است.

## API پشتیبانی‌شده

- `void setup()` / `void loop()`
- `pinMode(pin, INPUT|OUTPUT|INPUT_PULLUP)`
- `digitalWrite` / `digitalRead` / `analogWrite`
- `millis()` / `delay(ms)`
- `Serial.begin` / `print` / `println`
- `#define`، متغیرهای `int` / `bool` / `byte`
- `HIGH` / `LOW`

## اتصال به سخت‌افزار مجازی

- LED با «پایه آردوینو» از `digitalWrite` روشن می‌شود
- دکمه با پایه ورودی مقدار `digitalRead` را می‌دهد

## مثال Blink

```cpp
#define LED_PIN 13

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
```
