import os
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, List
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

# Pydantic Request Schemas
class LocationSchema(BaseModel):
    latitude: float = 23.0225
    longitude: float = 72.5714

class DemandSchema(BaseModel):
    known_avg_kw: Optional[float] = None
    category: Optional[str] = "commercial"

class StorageSchema(BaseModel):
    has_battery: Optional[bool] = False
    battery_capacity_kwh: Optional[float] = 0.0
    battery_current_pct: Optional[float] = 50.0
    has_backup_generator: Optional[bool] = False

class ForecastRequest(BaseModel):
    location: LocationSchema = Field(default_factory=LocationSchema)
    energy_type: str = "solar"  # "solar", "wind", "both"
    installed_capacity_kw: float = 75.0
    equipment_model: Optional[str] = "Generic"
    demand: Optional[DemandSchema] = Field(default_factory=DemandSchema)
    storage: Optional[StorageSchema] = Field(default_factory=StorageSchema)
    forecast_hours: Optional[int] = 72

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
    energy_type = req.energy_type.lower()
    forecast_days = max(1, min(7, (req.forecast_hours + 23) // 24))

    # 1. Fetch Live Weather Forecast
    df_weather = fetch_live_weather_forecast(
        latitude=req.location.latitude,
        longitude=req.location.longitude,
        forecast_days=forecast_days
    )
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

    # 3. Convert % to kW
    predicted_kw = np.round(predicted_pct * req.installed_capacity_kw, 2)
    predicted_pct_display = np.round(predicted_pct * 100.0, 1)

    # 4. Independent Demand Estimation
    demand_dict = req.demand.dict() if req.demand else {}
    hourly_demand_kw = estimate_hourly_demand(df_weather["timestamp"], demand_dict)

    # 5. Flagging & Recommendations
    storage = req.storage or StorageSchema()
    forecast_items = []

    for i in range(len(df_weather)):
        gen_kw = float(predicted_kw[i])
        dem_kw = float(hourly_demand_kw[i])
        
        flag = flag_generation_status(gen_kw, dem_kw)
        action = recommend_grid_action(
            flag=flag,
            has_battery=bool(storage.has_battery),
            battery_current_pct=float(storage.battery_current_pct or 50.0),
            has_backup_generator=bool(storage.has_backup_generator)
        )

        forecast_items.append({
            "timestamp": df_weather["timestamp"].iloc[i].isoformat(),
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
        "energy_type": energy_type,
        "installed_capacity_kw": req.installed_capacity_kw,
        "equipment_model": req.equipment_model,
        "total_forecasted_kwh": float(round(np.sum(predicted_kw), 1)),
        "peak_generation_kw": float(round(np.max(predicted_kw), 1)),
        "forecast": forecast_items
    }
