import math
import pytest
from pydantic import ValidationError
from backend.app.schemas import Measurement, SimulationResult, TestEvaluation, TestScenario, TestStatus
from backend.app.services.validation import evaluate_measurement

def make_scenario(tolerance: float = 0.1) -> TestScenario:
    return TestScenario(
        test_id="voltage-3v3",
        measurement_name="VCC",
        expected=3.3,
        tolerance=tolerance,
        unit="V",
    )


def test_measurement_inside_tolerance_passes():
    result = evaluate_measurement(make_scenario(), 3.35)
    assert result.status == TestStatus.passed


def test_measurement_outside_tolerance_fails():
    result = evaluate_measurement(make_scenario(), 3.5)
    assert result.status == TestStatus.failed


def test_exact_boundary_passes():
    result = evaluate_measurement(make_scenario(), 3.4)
    assert result.status == TestStatus.passed


@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_measurement_rejects_non_finite_values(value):
    with pytest.raises(ValidationError):
        Measurement(name="VCC", value=value, unit="V")


@pytest.mark.parametrize("field", ["expected", "tolerance"])
@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_scenario_rejects_non_finite_limits(field, value):
    data = {"test_id": "vcc", "measurement_name": "VCC", "expected": 3.3, "tolerance": 0.1}
    data[field] = value
    with pytest.raises(ValidationError):
        TestScenario(**data)


@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_evaluation_rejects_non_finite_measurements(value):
    with pytest.raises(ValidationError):
        TestEvaluation(test_id="vcc", status=TestStatus.failed, expected=3.3,
            actual=value, tolerance=0.1, unit="V", message="invalid")


@pytest.mark.parametrize("field", ["node_voltages", "branch_currents"])
@pytest.mark.parametrize("value", [math.nan, math.inf, -math.inf])
def test_simulation_result_rejects_non_finite_values(field, value):
    with pytest.raises(ValidationError):
        SimulationResult(engine="ngspice", status="COMPLETED", output="",
            elapsed_ms=1, message="ok", **{field: {"n1": value}})
