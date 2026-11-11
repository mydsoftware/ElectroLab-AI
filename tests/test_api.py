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
    response = client.post("/api/v1/tests/evaluate?actual=3.31", json={
        "test_id": "vcc", "measurement_name": "VCC", "expected": 3.3,
        "tolerance": 0.1, "unit": "V"})
    assert response.status_code == 200
    assert response.json()["status"] == "PASS"

def test_simulation_rejects_control_directives():
    response = client.post("/api/v1/simulations/ngspice", json={
        "netlist": ".control\nquit\n.end"})
    assert response.status_code == 422

def test_simulation_requires_engine(monkeypatch):
    import backend.app.main as main
    monkeypatch.setattr(main, "simulate_netlist",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(RuntimeError("ngspice missing")))
    response = client.post("/api/v1/simulations/ngspice", json={
        "netlist": "V1 in 0 5\nR1 in 0 1k\n.op\n.end"})
    assert response.status_code == 503


import pytest


@pytest.mark.parametrize("actual", ["nan", "inf", "-inf"])
def test_evaluate_endpoint_rejects_non_finite_actual(actual):
    response = client.post(f"/api/v1/tests/evaluate?actual={actual}", json={
        "test_id": "vcc", "measurement_name": "VCC", "expected": 3.3,
        "tolerance": 0.1, "unit": "V"})
    assert response.status_code == 422
