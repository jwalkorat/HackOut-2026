import numpy as np
import pandas as pd

CATEGORY_DEFAULTS_KW = {
    "residential": 5.0,
    "commercial": 40.0,
    "industrial": 250.0
}

def estimate_hourly_demand(timestamps: pd.Series, demand_input: dict) -> np.ndarray:
    """
    Independent Demand Estimator:
    Uses user-provided known demand OR category average with a standard daily load curve shape.
    Multiplier centers around 1.0 (overnight ~0.65x, midday ~1.0x, evening peak 6-9pm ~1.35x).
    """
    known_avg_kw = demand_input.get("known_avg_kw")
    category = (demand_input.get("category") or "commercial").lower()

    if known_avg_kw is not None and float(known_avg_kw) > 0:
        base_demand_kw = float(known_avg_kw)
    else:
        base_demand_kw = CATEGORY_DEFAULTS_KW.get(category, 40.0)

    hours = timestamps.dt.hour
    
    # Normalized daily load curve centered at 1.0x:
    # Lowest overnight (3-4 AM) ~0.65x (26 kW for 40 kW base)
    # Midday plateau ~1.05x (42 kW)
    # Evening peak (7-9 PM) ~1.35x (54 kW)
    load_curve_multiplier = (
        1.0 
        + 0.25 * np.sin(2 * np.pi * (hours - 8) / 24.0) 
        + 0.35 * np.exp(-((hours - 20.0)**2) / 6.0)
    )
    
    hourly_demand = base_demand_kw * load_curve_multiplier
    return np.round(hourly_demand, 2)
