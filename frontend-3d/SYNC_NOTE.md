# همگام‌سازی با ترموکس

```bash
cd ~/ElectroLab-AI
git fetch origin
git reset --hard origin/main
cd frontend-3d
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

بعد از pull باید در نوار ابزار ببینی:
- قطعات: منبع، R، LED، C، AC، L، دیود، GND، دکمه، پتانسیومتر، ترانزیستور
- بردها: Arduino Uno، ESP32، Pico، STM32
