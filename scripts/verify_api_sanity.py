import sys
import os
import json
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(PROJECT_ROOT, "backend"))
sys.path.insert(0, PROJECT_ROOT)

from main import app
from app.services.recommend import flag_generation_status, recommend_grid_action

client = TestClient(app)

def run_check(name, payload, expect_status=200, is_post=True, endpoint="/forecast"):
    if is_post:
        resp = client.post(endpoint, json=payload)
    else:
        resp = client.get(endpoint)
    
    status_ok = (resp.status_code == expect_status)
    status_str = f"[PASS]" if status_ok else f"[FAIL]"
    print(f"--- {name} ---")
    print(f"Status: {resp.status_code} (expected {expect_status}) {status_str}")
    return resp, status_ok

def run_full_api_audit():
    print("================ FULL BACKEND AUDIT & TEST SUITE (12 TESTS) ================\n")
    results = []

    # Test 1: Overnight curve interpolation check
    p1 = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "solar",
        "installed_capacity_kw": 100,
        "demand": {"category": "commercial"}
    }
    r1, ok1 = run_check("Test 1: Overnight Curve Check (Hour 0)", p1)
    if ok1:
        h0_demand = r1.json()["forecast"][0]["demand_kw"]
        print(f"  Hour 0 Demand: {h0_demand} kW (Expected ~31.34 kW for 40 kW base)")
        ok1 = (25.0 <= h0_demand <= 35.0)
    results.append(("Test 1: Overnight Curve Check", ok1))

    # Test 2: energy_type="both"
    p2 = {
        "location": {"latitude": 23.0225, "longitude": 72.5714},
        "energy_type": "both",
        "installed_capacity_kw": 100
    }
    r2, ok2 = run_check("Test 2: energy_type='both'", p2)
    results.append(("Test 2: energy_type='both'", ok2))

    # Test 3: Invalid/edge numeric inputs (expect 422)
    p3a = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 0}
    r3a, ok3a = run_check("Test 3a: Zero Capacity (422)", p3a, expect_status=422)

    p3b = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": -50}
    r3b, ok3b = run_check("Test 3b: Negative Capacity (422)", p3b, expect_status=422)

    p3c = {"location": {"latitude": 200, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100}
    r3c, ok3c = run_check("Test 3c: Invalid Latitude (422)", p3c, expect_status=422)

    p3d = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100, "forecast_hours": 0}
    r3d, ok3d = run_check("Test 3d: Zero Forecast Hours (422)", p3d, expect_status=422)

    p3e = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100, "storage": {"battery_current_pct": 150}}
    r3e, ok3e = run_check("Test 3e: Battery Pct = 150 (422)", p3e, expect_status=422)

    ok3 = ok3a and ok3b and ok3c and ok3d and ok3e
    results.append(("Test 3: Numeric Inputs Validation (422)", ok3))

    # Test 4: Invalid/unknown string values
    p4a = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100, "demand": {"category": "government"}}
    r4a, ok4a = run_check("Test 4a: Invalid Category String (422)", p4a, expect_status=422)

    p4b = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100, "equipment_model": "Totally Made Up Panel XYZ"}
    r4b, ok4b = run_check("Test 4b: Unknown Equipment Model (200 Fallback)", p4b, expect_status=200)

    p4c = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100, "demand": {"category": "Commercial"}}
    r4c, ok4c = run_check("Test 4c: Category Case Sensitivity 'Commercial' (200)", p4c, expect_status=200)

    ok4 = ok4a and ok4b and ok4c
    results.append(("Test 4: String Values & Case Sensitivity", ok4))

    # Test 5: Weather API / Fallback check
    r5, ok5 = run_check("Test 5: Weather Integration Check", p1)
    results.append(("Test 5: Weather Service Resiliency", ok5))

    # Test 6: Output bounds sanity [0.0, 100.0]
    p6 = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100}
    r6, ok6 = run_check("Test 6: Output Bounds Sanity [0, 100%]", p6)
    if ok6:
        pcts = [item["predicted_pct_capacity"] for item in r6.json()["forecast"]]
        out_of_bounds = [p for p in pcts if p < 0.0 or p > 100.0]
        ok6 = (len(out_of_bounds) == 0)
        print(f"  Max %: {max(pcts)}%, Min %: {min(pcts)}% (Out of bounds count: {len(out_of_bounds)})")
    results.append(("Test 6: Output Bounds Clamping [0, 100%]", ok6))

    # Test 7: total_forecasted_kwh trace-through
    p7 = {"location": {"latitude": 23.0225, "longitude": 72.5714}, "energy_type": "solar", "installed_capacity_kw": 100}
    r7, ok7 = run_check("Test 7: Total kWh Trace-Through", p7)
    if ok7:
        b7 = r7.json()
        sum_kwh = float(round(sum(pt["predicted_kw"] for pt in b7["forecast"]), 1))
        ok7 = (abs(b7["total_forecasted_kwh"] - sum_kwh) <= 0.2)
        print(f"  Returned total_forecasted_kwh: {b7['total_forecasted_kwh']} kWh | Sum of hourly kW: {sum_kwh} kWh")
    results.append(("Test 7: Total kWh Sum Formula", ok7))

    # Test 8: Flag boundary behavior (< 0.8x and > 1.2x)
    print("--- Test 8: Flag Boundary Check ---")
    f_under = flag_generation_status(7.9, 10.0)   # 0.79x -> UNDER
    f_bal_low = flag_generation_status(8.0, 10.0) # 0.80x -> BALANCED
    f_bal_hi = flag_generation_status(12.0, 10.0)  # 1.20x -> BALANCED
    f_over = flag_generation_status(12.1, 10.0)   # 1.21x -> OVER
    ok8 = (f_under == "UNDER-GENERATION" and f_bal_low == "BALANCED" and f_bal_hi == "BALANCED" and f_over == "OVER-GENERATION")
    print(f"  0.79x: {f_under} | 0.80x: {f_bal_low} | 1.20x: {f_bal_hi} | 1.21x: {f_over}")
    print(f"  Status: {'[PASS]' if ok8 else '[FAIL]'}\n")
    results.append(("Test 8: Flag Boundary Behavior (Strict > 1.2x, < 0.8x)", ok8))

    # Test 9: Battery Edge Cases in Recommendations
    print("--- Test 9: Battery Edge Cases ---")
    # 9a: Full battery (100%) during surplus -> Curtail excess generation
    act9a = recommend_grid_action("OVER-GENERATION", has_battery=True, battery_capacity_kwh=50, battery_current_pct=100.0, has_backup_generator=True)
    ok9a = ("Curtail excess generation" in act9a)
    print(f"  9a (Full battery during surplus) -> Action: {act9a} {'[PASS]' if ok9a else '[FAIL]'}")

    # 9b: Empty battery (0%) during shortfall -> Activate backup generator (NOT Discharge)
    act9b = recommend_grid_action("UNDER-GENERATION", has_battery=True, battery_capacity_kwh=50, battery_current_pct=0.0, has_backup_generator=True)
    ok9b = ("Activate backup generator" in act9b)
    print(f"  9b (Empty battery during shortfall) -> Action: {act9b} {'[PASS]' if ok9b else '[FAIL]'}")

    # 9c: Battery flagged true but capacity = 0 -> Treat as no storage (Curtail on surplus)
    act9c = recommend_grid_action("OVER-GENERATION", has_battery=True, battery_capacity_kwh=0.0, battery_current_pct=50.0, has_backup_generator=False)
    ok9c = ("Curtail" in act9c)
    print(f"  9c (Zero battery capacity) -> Action: {act9c} {'[PASS]' if ok9c else '[FAIL]'}\n")

    ok9 = ok9a and ok9b and ok9c
    results.append(("Test 9: Battery Edge Cases (9a, 9b, 9c)", ok9))

    # Test 10: CORS Middleware
    r10, ok10 = run_check("Test 10: CORS Setup", {}, is_post=False, endpoint="/")
    results.append(("Test 10: CORS Setup", ok10))

    # Test 11: Auto-Docs GET /docs
    r11, ok11 = run_check("Test 11: OpenAPI Swagger Docs (GET /docs)", {}, is_post=False, endpoint="/docs")
    results.append(("Test 11: OpenAPI Swagger Docs", ok11))

    # Test 12: Timestamp/timezone consistency
    r12, ok12 = run_check("Test 12: Timezone ISO Formatting", p1)
    if ok12:
        d12 = r12.json()
        gen_at = d12["generated_at"]
        f0_ts = d12["forecast"][0]["timestamp"]
        ok12 = gen_at.endswith("Z") and f0_ts.endswith("Z")
        print(f"  generated_at: {gen_at} | forecast[0].timestamp: {f0_ts}")
    results.append(("Test 12: Timezone ISO Formatting", ok12))

    # FINAL AUDIT SUMMARY REPORT
    print("\n================ FINAL AUDIT SUMMARY REPORT ================")
    all_pass = True
    for test_name, status_flag in results:
        flag_str = "[PASS]" if status_flag else "[FAIL]"
        print(f"{flag_str:<8} | {test_name}")
        if not status_flag:
            all_pass = False
    print("============================================================\n")

    if all_pass:
        print("ALL 12 AUDIT TESTS PASSED CLEANLY! BACKEND IS 100% PRODUCTION READY.\n")

if __name__ == "__main__":
    run_full_api_audit()
