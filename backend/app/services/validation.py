"""موتور قطعی ارزیابی نتایج تست."""

from backend.app.schemas import TestEvaluation, TestScenario, TestStatus


def evaluate_measurement(
    scenario: TestScenario, actual: float
) -> TestEvaluation:
    """مقدار واقعی را با محدوده مجاز سناریو مقایسه می‌کند."""
    delta = abs(actual - scenario.expected)
    passed = delta <= scenario.tolerance
    status = TestStatus.passed if passed else TestStatus.failed

    return TestEvaluation(
        test_id=scenario.test_id,
        status=status,
        expected=scenario.expected,
        actual=actual,
        tolerance=scenario.tolerance,
        unit=scenario.unit,
        message=(
            "مقدار اندازه‌گیری‌شده در محدوده مجاز است."
            if passed
            else "مقدار اندازه‌گیری‌شده خارج از محدوده مجاز است."
        ),
    )
