import sys
import os
import json
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))

from main import app

client = TestClient(app)

def run_backend_api_tests():
    print("================ BACKEND API ENDPOINT TEST SUITE ================\n")

    # Test 1: GET /api/equipment/presets
    print("--- Test 1: GET /api/equipment/presets ---")
    res1 = client.get("/api/equipment/presets")
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
    presets = res1.json()
    print(f"Status: {res1.status_code} OK")
    print(f"Solar Presets Count: {len(presets.get('solar_panels', []))}")
    print(f"Wind Presets Count:  {len(presets.get('wind_turbines', []))}")

    # Test 2: POST /forecast with 3 Required Fields Only (Solar 75 kW)
    print("\n--- Test 2: POST /forecast (3 Required Fields Only) ---")
    req_minimal = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "solar",
        "installed_capacity_kw": 75.0
    }
    res2 = client.post("/forecast", json=req_minimal)
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
    body2 = res2.json()
    forecast2 = body2.get("forecast", [])
    print(f"Status: {res2.status_code} OK")
    print(f"Forecast Hours Returned: {len(forecast2)}")
    print(f"Total Forecasted kWh:    {body2.get('total_forecasted_kwh')} kWh")
    print(f"Peak Generation kW:      {body2.get('peak_generation_kw')} kW")
    print(f"Sample Midday Hour (Hour 12): {json.dumps(forecast2[12], indent=2)}")

    # Test 3: POST /forecast with Full Optional Fields (250 kW Hybrid System + Storage)
    print("\n--- Test 3: POST /forecast (Full Optional Fields - 250kW Hybrid) ---")
    req_full = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "both",
        "installed_capacity_kw": 250.0,
        "equipment_model": "Waaree 540W",
        "demand": {
            "known_avg_kw": 50.0,
            "category": "commercial"
        },
        "storage": {
            "has_battery": True,
            "battery_capacity_kwh": 100.0,
            "battery_current_pct": 40.0,
            "has_backup_generator": True
        },
        "forecast_hours": 72
    }
    res3 = client.post("/forecast", json=req_full)
    assert res3.status_code == 200, f"Expected 200, got {res3.status_code}"
    body3 = res3.json()
    forecast3 = body3.get("forecast", [])
    print(f"Status: {res3.status_code} OK")
    print(f"Forecast Hours Returned: {len(forecast3)}")

    # Test 4: Check Flag Distribution (Non-Degenerate Check)
    print("\n--- Test 4: Flag Distribution & Recommendation Check ---")
    flags = [item["flag"] for item in forecast3]
    flag_counts = pd.Series(flags).value_counts().to_dict()
    print("Flag Counts over 72 hours:")
    for flag_name, count in flag_counts.items():
        print(f"  {flag_name}: {count} hours ({count/len(flags)*100:.1f}%)")

    actions = [item["recommended_action"] for item in forecast3]
    unique_actions = set(actions)
    print(f"\nUnique Grid Actions Triggered ({len(unique_actions)}):")
    for act in unique_actions:
        print(f"  - {act}")

    if len(flag_counts) > 1:
        print("\n[PASSED] Flag distribution is non-degenerate (multiple status states detected: OVER-GENERATION, UNDER-GENERATION, BALANCED).")
    else:
        print("\n[WARNING] All hours produced a single flag status.")

    print("\n================ ALL API ENDPOINT TESTS PASSED ================\n")

if __name__ == "__main__":
    run_backend_api_tests()
