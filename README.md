# HackOut-2026: AI-Powered Renewable Generation Forecasting Platform

**Team Name:** MegaByte  
**Theme:** Renewable Energy Intelligence  
**Problem Statement:** AI-Powered Renewable Generation Forecasting Platform  

---

## 🚀 Executive Summary

Renewable energy generation (solar and wind) fluctuates constantly with weather and time of day, making grid capacity planning difficult. This platform provides **24–72 hour generation forecasting** paired with **independent demand profile estimation** and an **automated grid action decision engine**.

It enables grid operators, utility managers, and plant owners to:
1. **Forecast** solar and wind power output over 24–72 hours using live weather feeds (Open-Meteo API).
2. **Detect** periods of expected **Over-Generation (Surplus)** and **Under-Generation (Shortfall)**.
3. **Trigger Actionable Grid Responses**: Battery storage dispatch, curtailment warnings, and backup generator activation.

---

## 📊 ML Model Performance & Validation

Both Solar and Wind forecasting models predict **$\%$ of Installed Capacity** ($\text{Target} = \frac{\text{Actual Output}}{\text{Installed Capacity}}$), allowing a single model to generalize across any plant size or location.

| Model | MAE (% of Capacity) | Active MAPE | Feature Importances | Status |
| :--- | :--- | :--- | :--- | :--- |
| ☀️ **Solar Model** (XGBoost + Physics Proxy) | **1.23%** | **8.07%** | `solar_physics_proxy` (56%), `irradiance` (34%), `hour_cos` (8%) | 🟢 Validated |
| 💨 **Wind Model** (XGBoost) | **0.39%** | **2.83%** | `wind_speed` (87%), `hour_sin` (8%), `hour_cos` (5%) | 🟢 Validated |

* **Zero Data Leakage**: Chronological 85/15 train/test split. Features are strictly weather-driven.
* **Validation Artifacts**: Visual backtest plots and predictions saved in `/models/`.

---

## 🛠️ Project Structure

```
HackOut-2026/
├── backend/                  # FastAPI Web Server & Decision Engine
│   ├── main.py               # API Endpoints (POST /forecast, GET /api/equipment/presets)
│   └── app/
│       ├── data/             # Equipment Presets JSON (Waaree, SunPower, Vestas, Suzlon)
│       └── services/         # Weather Client, Feature Engineering, Demand & Recommendation Engines
├── data/                     # Ingested Datasets (Raw, Train, Test)
├── models/                   # Serialized Models (.pkl) & Backtest Visual Artifacts
├── scripts/                  # Data prep, training, verification & API test scripts
├── HackOut26_Problem_Statements.pdf
├── MegaByte_Report.pdf
├── README.md
└── .gitignore
```

---

## ⚡ FastAPI Backend API Usage

### 1. Equipment Presets
**Endpoint:** `GET /api/equipment/presets`

### 2. Live Forecast & Grid Recommendation
**Endpoint:** `POST /forecast`

#### Request Payload:
```json
{
  "location": {"latitude": 23.0225, "longitude": 72.5714},
  "energy_type": "solar",
  "installed_capacity_kw": 100,
  "equipment_model": "SunPower Maxeon 3",
  "demand": {
    "known_avg_kw": 25,
    "category": "commercial"
  },
  "storage": {
    "has_battery": true,
    "battery_capacity_kwh": 60,
    "battery_current_pct": 50,
    "has_backup_generator": true
  },
  "forecast_hours": 72
}
```

#### Response Payload:
```json
{
  "generated_at": "2026-09-12T05:34:25Z",
  "energy_type": "solar",
  "installed_capacity_kw": 100.0,
  "total_forecasted_kwh": 684.2,
  "peak_generation_kw": 61.4,
  "forecast": [
    {
      "timestamp": "2026-09-12T12:00:00",
      "predicted_pct_capacity": 61.4,
      "predicted_kw": 61.4,
      "demand_kw": 28.5,
      "flag": "OVER-GENERATION",
      "recommended_action": "Charge battery with surplus",
      "weather": {
        "irradiance": 820.0,
        "cloud_cover": 15.0,
        "temperature": 32.5,
        "wind_speed": 4.2
      }
    }
  ]
}
```

---

## 🏃 Running the Backend Locally

```bash
# Install dependencies
pip install fastapi uvicorn xgboost pandas scikit-learn requests matplotlib joblib

# Run backend server
uvicorn backend.main:app --reload --port 8000
```

---

## 🖥️ Running the Frontend Dashboard Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```
