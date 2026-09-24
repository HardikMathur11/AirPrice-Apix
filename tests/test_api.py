import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
API_HEADERS = {"X-API-Key": "airprice_demo_key_2026"}

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "database_health" in data

def test_get_current_apix():
    response = client.get("/api/v1/apix/current", headers=API_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "apix_value" in data
    assert "changes" in data
    assert data["base_year_value"] == 100.0

def test_get_routes():
    response = client.get("/api/v1/routes", headers=API_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert data["total_routes"] > 0

def test_get_route_prices():
    response = client.get("/api/v1/routes/DEL-BOM/prices?booking_window=T+7", headers=API_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["route_code"] == "DEL-BOM"
    assert "statistics" in data
    assert len(data["fares"]) == 11

def test_get_route_elasticity():
    response = client.get("/api/v1/routes/DEL-BOM/elasticity", headers=API_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "optimal_booking_window" in data
    assert len(data["windows"]) == 5

def test_unauthorized_access():
    response = client.get("/api/v1/apix/current", headers={"X-API-Key": "invalid_key"})
    assert response.status_code == 401
