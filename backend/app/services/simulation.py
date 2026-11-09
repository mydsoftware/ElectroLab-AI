"""اجرای محدود و ایزوله شبیه‌سازی با ngspice."""
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

from backend.app.schemas import SimulationEngineStatus, SimulationResult

_NODE = re.compile(r"^[A-Za-z0-9_.$+-]{1,40}$")
_VALUE = re.compile(r"^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?[TGMKUNPF]?$", re.I)

def validate_netlist(netlist: str) -> str:
    """فقط عناصر پایه و تحلیل نقطه‌کار را می‌پذیرد؛ بدون اسکریپت یا دسترسی فایل."""
    lines = [line.strip() for line in netlist.splitlines() if line.strip()]
    if not lines:
        raise ValueError("نت‌لیست خالی است.")
    safe = []
    has_end = False
    has_op = False
    for index, line in enumerate(lines):
        if line.startswith("*"):
            safe.append(line)
            continue
        if line.startswith("."):
            directive = line.lower()
            if directive == ".op":
                has_op = True
                safe.append(".op")
                continue
            if directive == ".end":
                has_end = True
                safe.append(".end")
                continue
            if directive.startswith(".title ") and index == 0:
                safe.append(line)
                continue
            raise ValueError(f"دستور SPICE مجاز نیست: {line.split()[0]}")
        if ";" in line or any(ch in line for ch in ("\x60", "$", "|", ">", "<")):
            raise ValueError("کاراکتر یا دستور غیرمجاز در نت‌لیست وجود دارد.")
        tokens = line.split()
        prefix = tokens[0][:1].upper()
        if prefix in {"R", "C", "L"} and len(tokens) == 4:
            if not all(_NODE.fullmatch(x) for x in tokens[1:3]) or not _VALUE.fullmatch(tokens[3]):
                raise ValueError(f"مقدار یا گره نامعتبر در خط: {line}")
        elif prefix in {"V", "I"} and len(tokens) in {4, 5}:
            if not all(_NODE.fullmatch(x) for x in tokens[1:3]):
                raise ValueError(f"نام گره نامعتبر در خط: {line}")
            if len(tokens) == 4:
                value = tokens[3]
            elif tokens[3].upper() == "DC":
                value = tokens[4]
            else:
                raise ValueError("در این نسخه منابع فقط مقدار ثابت DC می‌پذیرند.")
            if not _VALUE.fullmatch(value):
                raise ValueError(f"مقدار منبع نامعتبر است: {value}")
        else:
            raise ValueError(f"عنصر یا قالب پشتیبانی‌نشده: {line}")
        safe.append(line)
    if not has_op or not has_end:
        raise ValueError("نت‌لیست باید شامل .op و .end باشد.")
    return "\n".join(safe) + "\n"

def ngspice_status() -> SimulationEngineStatus:
    executable = shutil.which("ngspice")
    if not executable:
        return SimulationEngineStatus(engine="ngspice", available=False,
            details="ngspice در PATH سیستم پیدا نشد؛ برای شبیه‌سازی نصب شود.")
    try:
        result = subprocess.run([executable, "--version"], capture_output=True,
            text=True, timeout=3, check=False)
        output = (result.stdout or result.stderr).strip().splitlines()
        version = output[0][:160] if output else "نسخه نامشخص"
        return SimulationEngineStatus(engine="ngspice", available=True,
            version=version, details="موتور ngspice در سیستم قابل دسترسی است.")
    except (OSError, subprocess.TimeoutExpired) as exc:
        return SimulationEngineStatus(engine="ngspice", available=False,
            details=f"بررسی نسخه موتور ناموفق بود: {exc.__class__.__name__}")

def simulate_netlist(netlist: str, timeout_seconds: int = 10) -> SimulationResult:
    safe_netlist = validate_netlist(netlist)
    executable = shutil.which("ngspice")
    if not executable:
        raise RuntimeError("ngspice نصب نیست یا در PATH قرار ندارد.")
    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="electrolab-") as workdir:
        circuit = Path(workdir) / "circuit.cir"
        circuit.write_text(safe_netlist, encoding="utf-8")
        try:
            process = subprocess.run([executable, "-b", str(circuit)],
                cwd=workdir, capture_output=True, text=True,
                timeout=timeout_seconds, check=False)
        except subprocess.TimeoutExpired as exc:
            raise TimeoutError("زمان مجاز شبیه‌سازی به پایان رسید.") from exc
        output = ((process.stdout or "") + (process.stderr or ""))[-100000:]
        elapsed = int((time.perf_counter() - started) * 1000)
        if process.returncode != 0:
            return SimulationResult(engine="ngspice", status="ERROR",
                output=output, elapsed_ms=elapsed,
                message="ngspice مدار را با خطا متوقف کرد.")
        return SimulationResult(engine="ngspice", status="COMPLETED",
            output=output, elapsed_ms=elapsed,
            message="تحلیل نقطه‌کار با موفقیت اجرا شد.")
