"""نقطه ورود API پلتفرم ElectroLab AI."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.app.schemas import (BoardProfile, SimulationEngineStatus,
    SimulationRequest, SimulationResult, TestEvaluation, TestScenario)
from backend.app.services.simulation import ngspice_status, simulate_netlist
from backend.app.services.validation import evaluate_measurement

app = FastAPI(title="ElectroLab AI",
    description="API آزمایشگاه شبیه‌سازی، تست و اعتبارسنجی بردهای الکترونیکی",
    version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
    allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])

BOARDS = [
    BoardProfile(board_id="arduino-uno", name="Arduino Uno", family="AVR",
        simulation_support="planned", hardware_test_support="planned",
        notes="پروفایل اولیه؛ تست فیزیکی هنوز فعال نیست."),
    BoardProfile(board_id="esp32-devkit-v1", name="ESP32 DevKit V1", family="ESP32",
        simulation_support="partial", hardware_test_support="planned",
        notes="برد هدف برای MVP؛ شبیه‌سازی MCU و تست فیزیکی هنوز کامل نیست."),
    BoardProfile(board_id="stm32-generic", name="STM32 Generic", family="ARM Cortex-M",
        simulation_support="planned", hardware_test_support="planned"),
]

@app.get("/")
def root() -> dict[str, str]:
    return {"name": "ElectroLab AI", "version": "0.2.0", "status": "running"}

@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "electrolab-api"}

@app.get("/api/v1/boards", response_model=list[BoardProfile])
def list_boards() -> list[BoardProfile]:
    return BOARDS

@app.get("/api/v1/simulators/ngspice", response_model=SimulationEngineStatus)
def get_ngspice_status() -> SimulationEngineStatus:
    return ngspice_status()

@app.post("/api/v1/simulations/ngspice", response_model=SimulationResult)
def run_ngspice_simulation(request: SimulationRequest) -> SimulationResult:
    try:
        return simulate_netlist(request.netlist, request.timeout_seconds)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=408, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

@app.post("/api/v1/tests/evaluate", response_model=TestEvaluation)
def evaluate_test(scenario: TestScenario, actual: float) -> TestEvaluation:
    if not (-1e12 <= actual <= 1e12):
        raise HTTPException(status_code=422, detail="مقدار اندازه‌گیری خارج از محدوده پشتیبانی است.")
    return evaluate_measurement(scenario, actual)
