"""Models."""
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field, field_validator

class TestStatus(str, Enum):
    passed = "PASS"
    failed = "FAIL"
    error = "ERROR"
    skipped = "SKIPPED"

class Measurement(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    value: float
    unit: str = Field(default="", max_length=24)

class TestScenario(BaseModel):
    test_id: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=500)
    measurement_name: str = Field(min_length=1, max_length=100)
    expected: float
    tolerance: float = Field(default=0, ge=0)
    unit: str = Field(default="", max_length=24)

class TestEvaluation(BaseModel):
    test_id: str
    status: TestStatus
    expected: float
    actual: float
    tolerance: float
    unit: str
    message: str

class BoardProfile(BaseModel):
    board_id: str
    name: str
    family: str
    simulation_support: str
    hardware_test_support: str
    notes: str = ""

class SimulationEngineStatus(BaseModel):
    engine: str
    available: bool
    version: str | None = None
    details: str

class SimulationRequest(BaseModel):
    netlist: str = Field(min_length=1, max_length=20000)
    timeout_seconds: int = Field(default=10, ge=1, le=20)

    @field_validator("netlist")
    @classmethod
    def netlist_must_not_be_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("متن مدار خالی است.")
        return value

class SimulationResult(BaseModel):
    engine: str
    status: str
    output: str
    elapsed_ms: int
    message: str
    node_voltages: dict[str, float] = Field(default_factory=dict)
    branch_currents: dict[str, float] = Field(default_factory=dict)

class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    board_id: str
    description: str = Field(default="", max_length=2000)
    metadata: dict[str, Any] = Field(default_factory=dict)
