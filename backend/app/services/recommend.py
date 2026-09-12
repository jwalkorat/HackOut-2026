OVER_THRESHOLD = 1.2
UNDER_THRESHOLD = 0.8

def flag_generation_status(gen_kw: float, demand_kw: float) -> str:
    if demand_kw <= 0:
        return "BALANCED"
    ratio = gen_kw / demand_kw
    if ratio > OVER_THRESHOLD:
        return "OVER-GENERATION"
    elif ratio < UNDER_THRESHOLD:
        return "UNDER-GENERATION"
    return "BALANCED"

def recommend_grid_action(
    flag: str,
    has_battery: bool = False,
    battery_capacity_kwh: float = 0.0,
    battery_current_pct: float = 50.0,
    has_backup_generator: bool = False
) -> str:
    # 9c: Treat zero battery capacity as no battery available
    effective_battery = has_battery and (battery_capacity_kwh > 0.0)

    if flag == "OVER-GENERATION":
        # 9a: Full battery (>= 95%) triggers curtailment instead of charging
        if effective_battery and battery_current_pct < 95.0:
            return "Charge battery with surplus"
        return "Curtail excess generation (battery full or no storage)"

    elif flag == "UNDER-GENERATION":
        # 9b: Low/empty battery (<= 15%) cannot discharge
        if effective_battery and battery_current_pct > 15.0:
            return "Discharge battery to cover shortfall"
        elif has_backup_generator:
            return "Activate backup generator"
        return "Shortfall risk - no storage/backup configured"

    return "No action needed - balanced"
