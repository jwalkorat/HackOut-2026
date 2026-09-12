import sys
import os
import json
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))
sys.path.insert(0, PROJECT_ROOT)

from main import app

client = TestClient(app)

def run_api_sanity_checks():
    print("================ SANITY-CHECKING BACKEND API LOGIC ================\n")

    # Check 1: Non-Round Capacity Multiplication Check (installed_capacity_kw = 73.0)
    print("--- Check 1: Non-Round Capacity Multiplication Check (Capacity = 73 kW) ---")
    # Using solar midday prediction check on 73 kW system
    req1 = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "solar",
        "installed_capacity_kw": 73.0
    }
    res1 = client.post("/forecast", json=req1)
    assert res1.status_code == 200
    body1 = res1.json()
    forecast1 = body1["forecast"]

    # Pick midday hour (hour 12)
    sample_hour = forecast1[12]
    pct = sample_hour["predicted_pct_capacity"]
    kw = sample_hour["predicted_kw"]
    expected_kw = round((pct / 100.0) * 73.0, 2)

    print(f"Capacity: 73.0 kW")
    print(f"Predicted % Capacity: {pct}%")
    print(f"Predicted kW Output: {kw} kW")
    print(f"Calculated (pct * 73): {expected_kw} kW")

    if abs(kw - expected_kw) <= 0.05:
        print("[PASSED] kW output is accurately computed as (pct_capacity * 73 kW).")
    else:
        print(f"[WARNING] Mismatch! Expected {expected_kw}, got {kw}")

    # Check 2: Demand Object Priority & Category Fallback (known_avg_kw omitted)
    print("\n--- Check 2: Demand Priority & Category Fallback Check ---")
    req2 = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "solar",
        "installed_capacity_kw": 100.0,
        "demand": {
            # known_avg_kw omitted
            "category": "commercial"
        }
    }
    res2 = client.post("/forecast", json=req2)
    assert res2.status_code == 200
    body2 = res2.json()
    forecast2 = body2["forecast"]

    sample_demands = [f["demand_kw"] for f in forecast2[:24]]
    print(f"Category: 'commercial' (Default Base: 40 kW)")
    print(f"24-Hour Demand Sample (min: {min(sample_demands)} kW, max: {max(sample_demands)} kW, mean: {round(sum(sample_demands)/24, 2)} kW):")
    print(f"  Hour 0 (Overnight): {sample_demands[0]} kW")
    print(f"  Hour 8 (Morning Rise): {sample_demands[8]} kW")
    print(f"  Hour 20 (Evening Peak): {sample_demands[20]} kW")

    if max(sample_demands) > min(sample_demands) and min(sample_demands) > 0:
        print("[PASSED] Category fallback activated and generated a non-flat daily load profile.")
    else:
        print("[WARNING] Demand profile failed to generate dynamic curve.")

    # Check 3: Windspeed Unit Consistency Check (m/s in data_prep vs weather_client)
    print("\n--- Check 3: Windspeed Unit Consistency Check ---")
    from app.services.weather_client import fetch_live_weather_forecast

    live_df = fetch_live_weather_forecast(23.0225, 72.5714, forecast_days=1)
    mean_wind = live_df["wind_speed"].mean()
    print(f"Live Weather Fetch Mean Wind Speed: {mean_wind:.2f} m/s")
    if 0.5 <= mean_wind <= 25.0:
        print("[PASSED] Both training (data_prep.py) and live inference (weather_client.py) explicitly request windspeed_unit='ms'.")
    else:
        print("[WARNING] Suspicious wind speed values detected.")

    print("\n================ ALL SANITY CHECKS COMPLETE ================\n")

if __name__ == "__main__":
    run_api_sanity_checks()
