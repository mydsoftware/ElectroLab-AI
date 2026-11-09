from backend.app.schemas import TestScenario, TestStatus
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
