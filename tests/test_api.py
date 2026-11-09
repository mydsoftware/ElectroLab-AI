from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_boards_endpoint():
    response = client.get("/api/v1/boards")
    assert response.status_code == 200
    ids = {board["board_id"] for board in response.json()}
    assert "esp32-devkit-v1" in ids


def test_evaluate_endpoint():
    response = client.post(
        "/api/v1/tests/evaluate?actual=3.31",
        json={
            "test_id": "vcc",
            "measurement_name": "VCC",
            "expected": 3.3,
            "tolerance": 0.1,
            "unit": "V",
        },
    )
    assert response.status_code == 200
    assert response.json()["status"] == "PASS"
