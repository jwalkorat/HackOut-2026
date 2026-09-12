import os
import joblib
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

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

app = FastAPI(
    title="HackOut'26 - AI Renewable Generation Forecasting API",
    description="Live decision-support API for 24-72h renewable power prediction and grid action recommendations",
    version="1.0.0"
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
    wind_path = os.path.join(MODELS_DIR, "wind_model.pkl")

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

# Pydantic Request Schemas with Field Constraints
class LocationSchema(BaseModel):
    latitude: float = Field(default=23.0225, ge=-90.0, le=90.0)
    longitude: float = Field(default=72.5714, ge=-180.0, le=180.0)

class DemandSchema(BaseModel):
    known_avg_kw: Optional[float] = Field(default=None, gt=0.0)
    category: Optional[str] = None

class StorageSchema(BaseModel):
    has_battery: bool = False
    battery_capacity_kwh: float = Field(default=0.0, ge=0.0)
    battery_current_pct: float = Field(default=50.0, ge=0.0, le=100.0)
    has_backup_generator: bool = False

class ForecastRequest(BaseModel):
    location: LocationSchema = Field(default_factory=LocationSchema)
    energy_type: str = Field(default="solar", description="'solar', 'wind', or 'both'")
    installed_capacity_kw: float = Field(default=75.0, gt=0.0)
    equipment_model: Optional[str] = "Generic"
    demand: Optional[DemandSchema] = None
    storage: StorageSchema = Field(default_factory=StorageSchema)
    forecast_hours: int = Field(default=72, ge=1, le=72)

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

    # 1. Fetch Live Weather Forecast
    try:
        df_weather, weather_source = fetch_live_weather_forecast(
            latitude=req.location.latitude,
            longitude=req.location.longitude,
            forecast_days=forecast_days
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail="Weather service temporarily unavailable, please try again")

    df_weather = df_weather.iloc[:req.forecast_hours].copy()

    # 2. Predict % Capacity Output
    pct_solar = np.zeros(len(df_weather))
    pct_wind = np.zeros(len(df_weather))

    if energy_type in ["solar", "both"] and "solar" in models:
        X_solar = prepare_solar_features(df_weather)
        pct_solar = np.clip(models["solar"].predict(X_solar), 0.0, 1.0)

    if energy_type in ["wind", "both"] and "wind" in models:
        X_wind = prepare_wind_features(df_weather)
        pct_wind = np.clip(models["wind"].predict(X_wind), 0.0, 1.0)

    if energy_type == "solar":
        predicted_pct = pct_solar
    elif energy_type == "wind":
        predicted_pct = pct_wind
    else:
        predicted_pct = 0.5 * (pct_solar + pct_wind)

    # Output Clamping [0.0, 100.0]
    predicted_pct_display = np.clip(np.round(predicted_pct * 100.0, 1), 0.0, 100.0)
    raw_predicted_kw = np.round((predicted_pct_display / 100.0) * req.installed_capacity_kw, 2)

    # B1 Fix: Apply equipment efficiency multiplier relative to Generic baseline (20.0%)
    # This makes equipment_model selection meaningfully change predicted_kw output.
    GENERIC_SOLAR_EFFICIENCY_PCT = 20.0
    efficiency_multiplier = 1.0
    if energy_type in ["solar", "both"] and req.equipment_model:
        eq_spec = get_equipment_spec(req.equipment_model, energy_type="solar")
        eq_efficiency = eq_spec.get("efficiency_pct", GENERIC_SOLAR_EFFICIENCY_PCT)
        efficiency_multiplier = eq_efficiency / GENERIC_SOLAR_EFFICIENCY_PCT
    predicted_kw = np.round(raw_predicted_kw * efficiency_multiplier, 2)

    # 3. Independent Demand Estimation
    demand_dict = req.demand.dict() if req.demand else {}
    hourly_demand_kw = estimate_hourly_demand(
        timestamps=df_weather["timestamp"],
        demand_input=demand_dict,
        installed_capacity_kw=req.installed_capacity_kw
    )

    # 4. Flagging & Recommendations
    storage = req.storage
    forecast_items = []

    # Fix: Ensure 0.0 is preserved and not overridden by falsy fallback
    batt_cap = float(storage.battery_capacity_kwh if storage.battery_capacity_kwh is not None else 0.0)
    batt_pct = float(storage.battery_current_pct if storage.battery_current_pct is not None else 50.0)

    for i in range(len(df_weather)):
        gen_kw = float(predicted_kw[i])
        dem_kw = float(hourly_demand_kw[i])
        
        flag = flag_generation_status(gen_kw, dem_kw)
        action = recommend_grid_action(
            flag=flag,
            has_battery=bool(storage.has_battery),
            battery_capacity_kwh=batt_cap,
            battery_current_pct=batt_pct,
            has_backup_generator=bool(storage.has_backup_generator)
        )

        forecast_items.append({
            "timestamp": df_weather["timestamp"].iloc[i].isoformat() + "Z" if not df_weather["timestamp"].iloc[i].isoformat().endswith("Z") else df_weather["timestamp"].iloc[i].isoformat(),
            "predicted_pct_capacity": float(predicted_pct_display[i]),
            "predicted_kw": gen_kw,
            "demand_kw": dem_kw,
            "flag": flag,
            "recommended_action": action,
            "weather": {
                "irradiance": float(round(df_weather["irradiance"].iloc[i], 1)),
                "cloud_cover": float(round(df_weather["cloud_cover"].iloc[i], 1)),
                "temperature": float(round(df_weather["temperature"].iloc[i], 1)),
                "wind_speed": float(round(df_weather["wind_speed"].iloc[i], 1))
            }
        })

    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "weather_data_source": weather_source,
        "energy_type": energy_type,
        "installed_capacity_kw": req.installed_capacity_kw,
        "equipment_model": req.equipment_model or "Generic",
        "equipment_efficiency_multiplier": round(efficiency_multiplier, 4),
        "total_forecasted_kwh": float(round(np.sum(predicted_kw), 1)),
        "peak_generation_kw": float(round(np.max(predicted_kw), 1)),
        "forecast": forecast_items
    }
