import sys
import os
import json
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

from main import app
from app.services.recommend import flag_generation_status, recommend_grid_action

client = TestClient(app)

def run_comprehensive_backend_verification():
    print("================ COMPREHENSIVE BACKEND VERIFICATION ================\n")

    # 1. Preset Lookup Verification
    res_preset = client.get("/api/equipment/presets")
    assert res_preset.status_code == 200
    presets = res_preset.json()
    print(f"1. Presets Endpoint: Status 200 OK (Solar: {len(presets.get('solar_panels', []))}, Wind: {len(presets.get('wind_turbines', []))})")

    # 2. Live Forecast Endpoint - Standard Request
    req_std = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "solar",
        "installed_capacity_kw": 100.0,
        "equipment_model": "SunPower Maxeon 3",
        "demand": {"known_avg_kw": 25.0},
        "storage": {
            "has_battery": True,
            "battery_capacity_kwh": 60.0,
            "battery_current_pct": 50.0,
            "has_backup_generator": True
        },
        "forecast_hours": 24
    }
    res_std = client.post("/forecast", json=req_std)
    assert res_std.status_code == 200
    body = res_std.json()
    print(f"2. Forecast Endpoint: Status 200 OK | Generated At: {body['generated_at']}")
    print(f"   Total Forecasted kWh: {body['total_forecasted_kwh']} kWh | Peak kW: {body['peak_generation_kw']} kW")

    # 3. Rule Engine Flag Logic Verification across test scenarios
    scenarios = [
        ("Surplus Scenario", 85.0, 30.0, True, 40.0, True),
        ("Shortfall Scenario", 10.0, 45.0, True, 30.0, True),
        ("Balanced Scenario", 40.0, 40.0, False, 50.0, False)
    ]
    print("\n3. Flag & Recommendation Rule Engine Verification:")
    for name, gen, dem, batt, batt_pct, gen_avail in scenarios:
        flag = flag_generation_status(gen, dem)
        act = recommend_grid_action(flag, has_battery=batt, battery_current_pct=batt_pct, has_backup_generator=gen_avail)
        print(f"   [{name}] Gen: {gen}kW, Dem: {dem}kW -> Flag: {flag:<16} | Action: {act}")

    print("\n================ VERIFICATION COMPLETE - BACKEND READY ================\n")

if __name__ == "__main__":
    run_comprehensive_backend_verification()
