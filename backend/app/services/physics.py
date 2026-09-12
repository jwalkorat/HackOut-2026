"""
Physics-based correction factors applied ON TOP of the AI model's raw predictions.

The XGBoost model outputs a fraction (0–1) of installed capacity, trained on
standard weather→generation data with GENERIC equipment assumptions (20% solar
efficiency, generic wind turbine: cut_in=3 m/s, rated=12 m/s, cut_out=25 m/s,
hub at 10 m reference height).

These formulas apply REAL-WORLD equipment-specific adjustments AFTER the model runs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Full Conversion Chain
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI model output  →  pct_capacity  (0–1 fraction of installed_capacity_kw)
                   ↓
  [SOLAR]  × η_ratio × F_temp(T) × F_tilt
  [WIND]   × power_curve_ratio(v_hub)  where v_hub uses wind shear model
                   ↓
  pct_adjusted  ×  installed_capacity_kw
                   ↓
  predicted_kw  (actual real-world output estimate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
from typing import Optional
import numpy as np

# ══════════════════════════════════════════════════════════════════
#  SOLAR PHYSICS ESTIMATION & CORRECTIONS
# ══════════════════════════════════════════════════════════════════

GENERIC_SOLAR_EFFICIENCY_PCT = 20.0   # baseline the model was trained against
STANDARD_TEST_TEMP_C         = 25.0   # IEC 61215 STC reference temperature
STANDARD_TEST_IRRADIANCE     = 1000.0 # IEC 61215 STC irradiance (W/m²)


def solar_physics_estimate(
    irradiance: np.ndarray,
    cloud_cover: Optional[np.ndarray] = None,
    irradiance_stc: float = STANDARD_TEST_IRRADIANCE,
) -> np.ndarray:
    """
    Physics-based solar capacity factor estimate (0–1 fraction).

    Formula
    -------
        pct_physics = clip(irradiance / irradiance_STC, 0.0, 1.0)

    Enforces strict physical constraints:
        - At STC (1000 W/m²), capacity factor is 1.0 (100%).
        - When irradiance < 5.0 W/m² (night / astronomical darkness), output is clamped to exactly 0.0.
    """
    irr = np.asarray(irradiance, dtype=float)
    pct = np.clip(irr / irradiance_stc, 0.0, 1.0)
    if cloud_cover is not None:
        cc = np.asarray(cloud_cover, dtype=float)
        pct = pct * (1.0 - 0.7 * (cc / 100.0))
        pct = np.clip(pct, 0.0, 1.0)
    pct[irr < 5.0] = 0.0
    return pct


def solar_efficiency_ratio(eq_spec: dict) -> float:
    """
    Ratio of the selected panel's efficiency vs. the generic 20% baseline.

    Formula
    -------
        η_ratio = η_panel (%) / η_generic (%)

    Example
    -------
        SunPower Maxeon 3 at 22.6 %  →  η_ratio = 22.6 / 20.0 = 1.13  (+13 % output)
        Canadian Solar HiKu at 20.7 %  →  η_ratio = 20.7 / 20.0 = 1.035  (+3.5 % output)
        Generic 20.0 %  →  η_ratio = 1.000  (no change)
    """
    return eq_spec.get("efficiency_pct", GENERIC_SOLAR_EFFICIENCY_PCT) / GENERIC_SOLAR_EFFICIENCY_PCT


def solar_temperature_derating(temperature_c: np.ndarray, eq_spec: dict) -> np.ndarray:
    """
    Temperature-dependent efficiency derating per IEC 61215.

    Formula
    -------
        F_temp(T) = 1 + γ × (T_actual − T_STC)

    Parameters
    ----------
    temperature_c : hourly ambient temperature array (°C)
    eq_spec       : equipment spec dict with ``temp_coeff_pct_per_c`` (always negative)

    Constants
    ---------
        T_STC = 25 °C   (Standard Test Conditions reference)
        γ     = temp_coeff_pct_per_c / 100  (e.g., −0.35 %/°C → −0.0035 /°C)

    Examples
    --------
        T = 25 °C, γ = −0.35 %/°C  →  F_temp = 1.000   (at STC, no change)
        T = 45 °C, γ = −0.35 %/°C  →  F_temp = 1 + (−0.0035)(45−25) = 0.930   (7.0 % loss)
        T = 15 °C, γ = −0.35 %/°C  →  F_temp = 1 + (−0.0035)(15−25) = 1.035   (3.5 % gain)
        T = 55 °C, γ = −0.29 %/°C  →  F_temp = 1 + (−0.0029)(55−25) = 0.913   (8.7 % loss)
    """
    gamma = eq_spec.get("temp_coeff_pct_per_c", -0.35) / 100.0
    return np.clip(1.0 + gamma * (temperature_c - STANDARD_TEST_TEMP_C), 0.5, 1.15)


def solar_tilt_factor(tilt_angle_deg: float, latitude_deg: float = 23.0) -> float:
    """
    Geometric tilt correction relative to optimal fixed-tilt south-facing angle.

    Optimal tilt for south-facing fixed arrays ≈ |latitude| (standard rule of thumb).

    Formula (cosine projection loss)
    ---------------------------------
        F_tilt = cos( |tilt_entered − tilt_optimal| × π/180 )

    where
        tilt_optimal ≈ |latitude|

    Examples
    --------
        latitude=23°, tilt_entered=23°  →  Δtilt= 0°  →  F_tilt = cos(  0°) = 1.000  (perfect)
        latitude=23°, tilt_entered=10°  →  Δtilt=13°  →  F_tilt = cos( 13°) = 0.974  (−2.6 %)
        latitude=23°, tilt_entered= 0°  →  Δtilt=23°  →  F_tilt = cos( 23°) = 0.921  (−7.9 %)
        latitude=35°, tilt_entered=20°  →  Δtilt=15°  →  F_tilt = cos( 15°) = 0.966  (−3.4 %)
    """
    optimal_tilt = abs(latitude_deg)
    delta = abs(tilt_angle_deg - optimal_tilt)
    return float(np.cos(np.radians(min(delta, 89.0))))


def apply_solar_corrections(
    pct_capacity: np.ndarray,
    weather_df,
    eq_spec: dict,
    tilt_angle_deg: float = None,
    latitude: float = 23.0,
) -> tuple:
    """
    Full solar correction pipeline applied to the AI model's raw % capacity.

    Final formula (per time step t)
    --------------------------------
        pct_adjusted(t) = pct_model(t) × η_ratio × F_temp(T_t) × F_tilt

    pct_adjusted is clamped to [0, 1] before multiplication with capacity_kw.

    Returns
    -------
    corrected_pct  : np.ndarray, shape (N,), clamped [0, 1]
    log            : dict — individual correction factors for API response transparency
    """
    eta_ratio = solar_efficiency_ratio(eq_spec)
    f_temp    = solar_temperature_derating(weather_df["temperature"].values.astype(float), eq_spec)
    _tilt     = tilt_angle_deg if tilt_angle_deg is not None else eq_spec.get("default_tilt_deg", 23)
    f_tilt    = solar_tilt_factor(float(_tilt), float(latitude))

    corrected = np.clip(pct_capacity * eta_ratio * f_temp * f_tilt, 0.0, 1.0)

    safe_base = np.where(pct_capacity > 1e-6, pct_capacity, 1e-6)
    log = {
        "method": "solar_physics",
        "eta_ratio": round(eta_ratio, 4),
        "avg_temp_derating_factor": round(float(np.mean(f_temp)), 4),
        "tilt_factor": round(f_tilt, 4),
        "avg_total_correction": round(float(np.mean(corrected / safe_base)), 4),
    }
    return corrected, log


# ══════════════════════════════════════════════════════════════════
#  WIND PHYSICS CORRECTIONS
# ══════════════════════════════════════════════════════════════════

# Generic turbine assumptions the model was trained against
GENERIC_WIND = {
    "cut_in_speed_ms":  3.0,
    "rated_speed_ms":  12.0,
    "cut_out_speed_ms": 25.0,
}
WIND_SHEAR_ALPHA   = 0.14    # Hellmann exponent — flat/open terrain (IEC 61400)
WEATHER_REF_HEIGHT = 10.0    # Open-Meteo wind speed reference height (m)


def wind_speed_at_hub(v_10m: np.ndarray, hub_height_m: float) -> np.ndarray:
    """
    Power-law wind shear extrapolation from meteorological reference height to hub.

    Reference: IEC 61400-12-1 / WMO No. 8 Guide to Met Instruments.

    Formula
    -------
        v_hub = v_ref × (h_hub / h_ref) ^ α

    where
        h_ref = 10 m  (standard meteorological measurement height)
        α     = 0.14  (Hellmann exponent — flat open terrain, IEC default)

    Examples
    --------
        v_10m= 8 m/s, h_hub=  80 m  →  v_hub = 8 × (80/10)^0.14 = 8 × 1.317 = 10.5 m/s
        v_10m= 8 m/s, h_hub= 120 m  →  v_hub = 8 × (120/10)^0.14= 8 × 1.401 = 11.2 m/s
        v_10m= 5 m/s, h_hub= 100 m  →  v_hub = 5 × (100/10)^0.14= 5 × 1.380 =  6.9 m/s
    """
    return v_10m * (hub_height_m / WEATHER_REF_HEIGHT) ** WIND_SHEAR_ALPHA


def turbine_power_curve(v: np.ndarray, cut_in: float, v_rated: float, cut_out: float) -> np.ndarray:
    """
    Normalised turbine power curve — fraction of rated power (0–1).

    Reference: IEC 61400-12-1 cubic ramp model.

    Formula
    -------
        P(v) = 0                                              if v < v_cut_in
        P(v) = ((v − v_cut_in) / (v_rated − v_cut_in)) ^ 3  if v_cut_in ≤ v < v_rated
        P(v) = 1.0                                            if v_rated ≤ v ≤ v_cut_out
        P(v) = 0                                              if v > v_cut_out  (safety shutdown)

    Examples (Vestas V117: cut_in=3, v_rated=13, cut_out=25)
    ----------------------------------------------------------
        v =  2 m/s  →  P = 0.000  (below cut-in)
        v =  5 m/s  →  P = ((5−3)/(13−3))^3 = (0.20)^3 = 0.008   (0.8 % rated)
        v =  8 m/s  →  P = ((8−3)/(13−3))^3 = (0.50)^3 = 0.125  (12.5 % rated)
        v = 11 m/s  →  P = ((11−3)/(13−3))^3= (0.80)^3 = 0.512  (51.2 % rated)
        v = 13 m/s  →  P = 1.000  (at rated speed, full output)
        v = 26 m/s  →  P = 0.000  (above cut-out, safety shutdown)
    """
    v = np.asarray(v, dtype=float)
    result = np.zeros(len(v), dtype=float)
    denom  = max(v_rated - cut_in, 1e-6)
    ramp   = (v >= cut_in) & (v < v_rated)
    rated  = (v >= v_rated) & (v <= cut_out)
    result[ramp]  = ((v[ramp] - cut_in) / denom) ** 3
    result[rated] = 1.0
    return result


def apply_wind_corrections(
    pct_capacity: np.ndarray,
    weather_df,
    turbine_spec: dict,
    hub_height_m: float = None,
) -> tuple:
    """
    Full wind turbine physics correction pipeline.

    Step 1 — Hub-height wind speed (power-law shear model)
    -------------------------------------------------------
        v_hub = v_10m × (h_hub / 10)^0.14

    Step 2 — Power curve ratio: actual turbine vs. generic baseline
    ---------------------------------------------------------------
        P_generic(v_hub)  using GENERIC_WIND specs
        P_turbine(v_hub)  using actual turbine cut-in/rated/cut-out
        correction(v_hub) = P_turbine / P_generic
                            (where P_generic ≈ 0 but turbine starts: use P_turbine directly)

    Step 3 — Apply to AI model's predicted % capacity
    --------------------------------------------------
        pct_adjusted(t) = pct_model(t) × correction(t)

    Final conversion to kW (done in main.py)
    ------------------------------------------
        predicted_kw(t) = pct_adjusted(t) × installed_capacity_kw

    Returns
    -------
    corrected_pct  : np.ndarray, clamped [0, 1]
    log            : dict — key physics values for API response transparency
    """
    h_hub  = float(hub_height_m or turbine_spec.get("default_hub_height_m", 80))
    v_10m  = weather_df["wind_speed"].values.astype(float)

    # Step 1: hub-height extrapolation
    v_hub  = wind_speed_at_hub(v_10m, h_hub)

    cut_in  = float(turbine_spec.get("cut_in_speed_ms",  3.0))
    v_rated = float(turbine_spec.get("rated_speed_ms",   12.0))
    cut_out = float(turbine_spec.get("cut_out_speed_ms", 25.0))

    # Step 2: Actual turbine IEC 61400 power curve
    p_turbine = turbine_power_curve(v_hub, cut_in, v_rated, cut_out)

    # Step 3: Physics-anchored blend:
    # 85% IEC 61400 physical aerodynamic curve + 15% ML learned nuance.
    # Enforces that rated wind speed reaches full rated power, eliminating the ML training ceiling.
    has_model_signal = float(np.max(pct_capacity)) > 1e-4
    if has_model_signal:
        blended = np.clip(0.15 * pct_capacity + 0.85 * p_turbine, 0.0, 1.0)
        corrected = np.maximum(blended, 0.85 * p_turbine)
    else:
        corrected = p_turbine

    # Enforce strict physical cut-in and cut-out safety shutdown
    corrected[v_hub < cut_in] = 0.0
    corrected[v_hub > cut_out] = 0.0

    log = {
        "method": "wind_physics",
        "hub_height_m": h_hub,
        "shear_alpha": WIND_SHEAR_ALPHA,
        "avg_v_10m_ms": round(float(np.mean(v_10m)), 2),
        "avg_v_hub_ms": round(float(np.mean(v_hub)), 2),
        "avg_capacity_factor": round(float(np.mean(corrected)), 4),
        "hours_below_cut_in": int(np.sum(v_hub < cut_in)),
        "hours_above_cut_out": int(np.sum(v_hub > cut_out)),
    }
    return corrected, log
