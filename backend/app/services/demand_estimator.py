import numpy as np
import pandas as pd
from fastapi import HTTPException

CATEGORY_DEFAULTS_KW = {
    "residential": 3.0,
    "commercial": 40.0,
    "industrial": 150.0
}

# Documented Anchor Points: (hour, multiplier)
#  - Hour 00 (Midnight)            : 0.7835x (31.34 kW for 40 kW base)
#  - Hour 03 (3 AM Night Trough)   : 0.7500x (30.00 kW for 40 kW base)
#  - Hour 08 (8 AM Morning Rise)   : 1.0000x (40.00 kW for 40 kW base)
#  - Hour 13 (1 PM Midday Plateau) : 1.0600x (42.40 kW for 40 kW base)
#  - Hour 20 (8 PM Evening Peak)   : 1.3500x (54.00 kW for 40 kW base)
#  - Hour 24 (Midnight)            : 0.7835x (31.34 kW for 40 kW base)
ANCHOR_HOURS = np.array([0, 3, 8, 13, 20, 24])
ANCHOR_MULTS = np.array([0.7835, 0.7500, 1.0000, 1.0600, 1.3500, 0.7835])

def infer_category_from_capacity(installed_capacity_kw: float) -> str:
    """
    Fallback-of-the-fallback: used only when neither demand.known_avg_kw
    nor demand.category is provided in the request.
    Heuristic: site scale roughly correlates with installed capacity.
    """
    if installed_capacity_kw < 10.0:
        return "residential"
    elif installed_capacity_kw <= 100.0:
        return "commercial"
    else:
        return "industrial"

def estimate_hourly_demand(
    timestamps: pd.Series,
    demand_input: dict,
    installed_capacity_kw: float = 75.0
) -> np.ndarray:
    """
    Independent Demand Estimator:
    Uses piecewise linear interpolation across 5 documented anchor points simultaneously:
      - Hour 00: 0.7835x (31.34 kW for 40 kW base)
      - Hour 03: 0.7500x (30.00 kW for 40 kW base)
      - Hour 08: 1.0000x (40.00 kW for 40 kW base)
      - Hour 13: 1.0600x (42.40 kW for 40 kW base)
      - Hour 20: 1.3500x (54.00 kW for 40 kW base)
    """
    known_avg_kw = demand_input.get("known_avg_kw") if demand_input else None
    explicit_category = demand_input.get("category") if demand_input else None

    if known_avg_kw is not None and float(known_avg_kw) > 0:
        base_demand_kw = float(known_avg_kw)
    elif explicit_category is not None:
        cat_str = str(explicit_category).strip().lower()
        if cat_str in CATEGORY_DEFAULTS_KW:
            base_demand_kw = CATEGORY_DEFAULTS_KW[cat_str]
        else:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid category '{explicit_category}'. Allowed values: {list(CATEGORY_DEFAULTS_KW.keys())}"
            )
    else:
        inferred_cat = infer_category_from_capacity(installed_capacity_kw)
        base_demand_kw = CATEGORY_DEFAULTS_KW[inferred_cat]

    hours = timestamps.dt.hour.values
    multipliers = np.interp(hours, ANCHOR_HOURS, ANCHOR_MULTS)
    
    hourly_demand = base_demand_kw * multipliers
    return np.round(hourly_demand, 2)
