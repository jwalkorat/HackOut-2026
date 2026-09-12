import os
import joblib
import requests as http_requests
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.services.weather_client import fetch_live_weather_forecast
from app.services.feature_engineering import prepare_solar_features, prepare_wind_features
from app.services.equipment_lookup import get_equipment_spec, load_equipment_presets
from app.services.demand_estimator import estimate_hourly_demand
from app.services.recommend import flag_generation_status, recommend_grid_action
from app.services.physics import apply_solar_corrections, apply_wind_corrections

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

app = FastAPI(
    title="HackOut'26 - AI Renewable Generation Forecasting API",
    description="Live decision-support API for 24-72h renewable power prediction and grid action recommendations",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
models: Dict[str, Any] = {}

@app.on_event("startup")
def load_models():
    solar_path = os.path.join(MODELS_DIR, "solar_model.pkl")
    wind_path  = os.path.join(MODELS_DIR, "wind_model.pkl")

    if os.path.exists(solar_path):
        models["solar"] = joblib.load(solar_path)
        print(f"Loaded Solar Model from {solar_path}")
    else:
        print(f"Warning: Solar model not found at {solar_path}")

    if os.path.exists(wind_path):
        models["wind"] = joblib.load(wind_path)
        print(f"Loaded Wind Model from {wind_path}")
    else:
        print(f"Warning: Wind model not found at {wind_path}")


# ──────────────────────────────────────────────────────────────
#  Pydantic Request Schemas
# ──────────────────────────────────────────────────────────────

class LocationSchema(BaseModel):
    latitude: float  = Field(default=23.0225, ge=-90.0,  le=90.0)
    longitude: float = Field(default=72.5714, ge=-180.0, le=180.0)

class DemandSchema(BaseModel):
    known_avg_kw: Optional[float] = Field(default=None, gt=0.0)
    category: Optional[str] = None

class StorageSchema(BaseModel):
    has_battery: bool = False
    battery_capacity_kwh: float = Field(default=0.0, ge=0.0)
    battery_current_pct: float  = Field(default=50.0, ge=0.0, le=100.0)
    has_backup_generator: bool  = False

class ForecastRequest(BaseModel):
    location: LocationSchema = Field(default_factory=LocationSchema)
    energy_type: str         = Field(default="solar", description="'solar', 'wind', or 'both'")
    installed_capacity_kw: float = Field(default=75.0, gt=0.0)

    # Equipment selection — drives physics corrections
    equipment_model: Optional[str]      = "Generic"   # solar panel model ID
    equipment_model_wind: Optional[str] = "Generic"   # wind turbine model ID

    # Layer-2 precision parameters
    tilt_angle_deg: Optional[float] = Field(default=None, ge=0.0, le=90.0,
        description="Solar array tilt angle (degrees). Defaults to panel preset optimal tilt.")
    hub_height_m: Optional[float]   = Field(default=None, ge=10.0, le=250.0,
        description="Wind turbine hub height (metres). Defaults to turbine preset default.")

    demand: Optional[DemandSchema] = None
    storage: StorageSchema = Field(default_factory=StorageSchema)
    forecast_hours: int    = Field(default=72, ge=1, le=72)


# ──────────────────────────────────────────────────────────────
#  Routes
# ──────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Renewable Generation Forecasting Engine",
        "team": "MegaByte",
        "hackathon": "HackOut'26"
    }


@app.get("/api/equipment/presets")
def get_presets():
    return load_equipment_presets()


@app.get("/api/geocode")
def geocode_location(q: str):
    """
    Geocode a free-text location name to latitude / longitude.
    Uses the Open-Meteo Geocoding API (no key required).
    """
    try:
        res = http_requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": q, "count": 5, "language": "en", "format": "json"},
            timeout=6
        )
        res.raise_for_status()
        data = res.json()
        results = data.get("results", [])
        if not results:
            raise HTTPException(status_code=404, detail=f"No location found for '{q}'")
        return {
            "query": q,
            "results": [
                {
                    "name": r.get("name"),
                    "country": r.get("country"),
                    "admin1": r.get("admin1", ""),
                    "latitude": r["latitude"],
                    "longitude": r["longitude"],
                    "display": f"{r.get('name')}, {r.get('admin1', '')}, {r.get('country','')}".strip(", ")
                }
                for r in results
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Geocoding service error: {str(e)}")


@app.post("/forecast")
@app.post("/api/forecast")
def generate_forecast(req: ForecastRequest):
    energy_type = req.energy_type.lower().strip()
    if energy_type not in ["solar", "wind", "both"]:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid energy_type '{req.energy_type}'. Must be 'solar', 'wind', or 'both'."
        )

    forecast_days = max(1, min(7, (req.forecast_hours + 23) // 24))

    # ── Step 1: Fetch Live Weather Forecast ───────────────────
    try:
        df_weather, weather_source = fetch_live_weather_forecast(
            latitude=req.location.latitude,
            longitude=req.location.longitude,
            forecast_days=forecast_days
        )
    except Exception:
        raise HTTPException(status_code=503, detail="Weather service temporarily unavailable, please try again")

    df_weather = df_weather.iloc[:req.forecast_hours].copy()

    # ── Step 2: AI Model — raw % capacity prediction (0–1) ────
    pct_solar = np.zeros(len(df_weather))
    pct_wind  = np.zeros(len(df_weather))

    if energy_type in ["solar", "both"] and "solar" in models:
        X_solar   = prepare_solar_features(df_weather)
        pct_solar = np.clip(models["solar"].predict(X_solar), 0.0, 1.0)

    if energy_type in ["wind", "both"] and "wind" in models:
        X_wind   = prepare_wind_features(df_weather)
        pct_wind = np.clip(models["wind"].predict(X_wind), 0.0, 1.0)

    # ── Step 3: Physics corrections (equipment + tech params) ─
    #
    # SOLAR — Three multiplicative correction factors applied per time step:
    #   pct_solar_adj(t) = pct_solar(t)
    #                      × η_ratio                          (panel efficiency vs generic)
    #                      × [1 + γ × (T(t) − 25)]           (temperature derating, IEC 61215)
    #                      × cos(|tilt − optimal_tilt| × π/180)  (geometric tilt correction)
    #
    # WIND — Two-stage correction applied per time step:
    #   v_hub(t) = v_10m(t) × (h_hub / 10)^0.14              (wind shear, IEC 61400)
    #   correction(t) = P_turbine(v_hub) / P_generic(v_hub)   (power curve ratio)
    #   pct_wind_adj(t) = pct_wind(t) × correction(t)
    #
    solar_corrections_log = {}
    wind_corrections_log  = {}

    if energy_type in ["solar", "both"]:
        eq_solar  = get_equipment_spec(req.equipment_model or "Generic", energy_type="solar")
        pct_solar, solar_corrections_log = apply_solar_corrections(
            pct_capacity  = pct_solar,
            weather_df    = df_weather,
            eq_spec       = eq_solar,
            tilt_angle_deg= req.tilt_angle_deg,
            latitude      = req.location.latitude,
        )

    if energy_type in ["wind", "both"]:
        eq_wind  = get_equipment_spec(req.equipment_model_wind or "Generic", energy_type="wind")
        pct_wind, wind_corrections_log = apply_wind_corrections(
            pct_capacity = pct_wind,
            weather_df   = df_weather,
            turbine_spec = eq_wind,
            hub_height_m = req.hub_height_m,
        )

    # ── Step 4: Combine solar + wind → % capacity ─────────────
    if energy_type == "solar":
        predicted_pct = pct_solar
    elif energy_type == "wind":
        predicted_pct = pct_wind
    else:  # both
        predicted_pct = 0.5 * (pct_solar + pct_wind)

    # ── Step 5: Convert % capacity → kW ───────────────────────
    #   predicted_kw(t) = predicted_pct(t) × installed_capacity_kw
    predicted_pct_display = np.clip(np.round(predicted_pct * 100.0, 1), 0.0, 100.0)
    predicted_kw          = np.round((predicted_pct_display / 100.0) * req.installed_capacity_kw, 2)

    # ── Step 6: Demand Estimation ──────────────────────────────
    demand_dict   = req.demand.dict() if req.demand else {}
    hourly_demand = estimate_hourly_demand(
        timestamps           = df_weather["timestamp"],
        demand_input         = demand_dict,
        installed_capacity_kw= req.installed_capacity_kw
    )

    # ── Step 7: Flag & Recommend ───────────────────────────────
    storage  = req.storage
    batt_cap = float(storage.battery_capacity_kwh if storage.battery_capacity_kwh is not None else 0.0)
    batt_pct = float(storage.battery_current_pct  if storage.battery_current_pct  is not None else 50.0)

    forecast_items = []
    for i in range(len(df_weather)):
        gen_kw = float(predicted_kw[i])
        dem_kw = float(hourly_demand[i])

        flag   = flag_generation_status(gen_kw, dem_kw)
        action = recommend_grid_action(
            flag                 = flag,
            has_battery          = bool(storage.has_battery),
            battery_capacity_kwh = batt_cap,
            battery_current_pct  = batt_pct,
            has_backup_generator = bool(storage.has_backup_generator)
        )

        ts = df_weather["timestamp"].iloc[i].isoformat()
        if not ts.endswith("Z"):
            ts += "Z"

        # Calculate explicit solar and wind kW breakdown
        if energy_type == "solar":
            sol_kw = gen_kw
            wnd_kw = 0.0
        elif energy_type == "wind":
            sol_kw = 0.0
            wnd_kw = gen_kw
        else:  # both
            sol_kw = float(round((pct_solar[i] * req.installed_capacity_kw) * 0.5, 2))
            wnd_kw = float(round((pct_wind[i]  * req.installed_capacity_kw) * 0.5, 2))

        forecast_items.append({
            "timestamp": ts,
            "predicted_pct_capacity": float(predicted_pct_display[i]),
            "predicted_kw": gen_kw,
            "solar_kw": sol_kw,
            "wind_kw": wnd_kw,
            "demand_kw": dem_kw,
            "flag": flag,
            "recommended_action": action,
            "weather": {
                "irradiance":  float(round(df_weather["irradiance"].iloc[i],  1)),
                "cloud_cover": float(round(df_weather["cloud_cover"].iloc[i], 1)),
                "temperature": float(round(df_weather["temperature"].iloc[i], 1)),
                "wind_speed":  float(round(df_weather["wind_speed"].iloc[i],  1)),
            }
        })

    # ── Assemble Equipment Summary ─────────────────────────────
    eq_solar_name = (get_equipment_spec(req.equipment_model or "Generic", "solar")
                     .get("model", "Generic")) if energy_type in ["solar", "both"] else None
    eq_wind_name  = (get_equipment_spec(req.equipment_model_wind or "Generic", "wind")
                     .get("model", "Generic")) if energy_type in ["wind", "both"] else None

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "weather_data_source": weather_source,
        "energy_type": energy_type,
        "installed_capacity_kw": req.installed_capacity_kw,
        "total_forecasted_kwh": float(round(np.sum(predicted_kw), 1)),
        "peak_generation_kw":   float(round(np.max(predicted_kw), 1)),

        # Equipment & Physics Correction Summary
        "equipment": {
            "solar_panel":   eq_solar_name,
            "wind_turbine":  eq_wind_name,
            "tilt_angle_deg": req.tilt_angle_deg,
            "hub_height_m":   req.hub_height_m,
        },
        "physics_corrections": {
            "solar": solar_corrections_log or None,
            "wind":  wind_corrections_log  or None,
        },

        "forecast": forecast_items
    }
