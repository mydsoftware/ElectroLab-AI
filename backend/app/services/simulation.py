"""آداپتور اولیه موتورهای شبیه‌سازی."""

import shutil
import subprocess

from backend.app.schemas import SimulationEngineStatus


def ngspice_status() -> SimulationEngineStatus:
    """وجود ngspice را بررسی می‌کند؛ در این مرحله مدار اجرا نمی‌شود."""
    executable = shutil.which("ngspice")
    if not executable:
        return SimulationEngineStatus(
            engine="ngspice",
            available=False,
            details="ngspice در PATH سیستم پیدا نشد؛ برای شبیه‌سازی نصب شود.",
        )

    try:
        result = subprocess.run(
            [executable, "--version"],
            capture_output=True,
            text=True,
            timeout=3,
            check=False,
        )
        output = (result.stdout or result.stderr).strip().splitlines()
        version = output[0][:160] if output else "نسخه نامشخص"
        return SimulationEngineStatus(
            engine="ngspice",
            available=True,
            version=version,
            details="موتور ngspice در سیستم قابل دسترسی است.",
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return SimulationEngineStatus(
            engine="ngspice",
            available=False,
            details=f"بررسی نسخه موتور ناموفق بود: {exc.__class__.__name__}",
        )
