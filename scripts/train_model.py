import os
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBRegressor

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

SOLAR_FEATURES = ["solar_physics_proxy", "irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
WIND_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

def train_forecasting_models():
    train_path = os.path.join(DATA_DIR, "train_data.csv")
    train_df = pd.read_csv(train_path)

    # Feature engineering: Physics Solar Proxy
    train_df["solar_physics_proxy"] = (train_df["irradiance"] / 1000.0) * (1.0 - train_df["cloud_cover"] / 100.0 * 0.7)

    # 1. Refined Solar Model Training (Physics-Informed)
    print("Training Refined Physics-Informed Solar Model...")
    X_train_solar = train_df[SOLAR_FEATURES]
    y_train_solar = train_df["target_pct_capacity_solar"]

    solar_model = XGBRegressor(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.03,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    solar_model.fit(X_train_solar, y_train_solar)

    solar_model_path = os.path.join(MODELS_DIR, "solar_model.pkl")
    joblib.dump(solar_model, solar_model_path)

    # 2. Wind Model Training
    print("Training Wind Model...")
    X_train_wind = train_df[WIND_FEATURES]
    y_train_wind = train_df["target_pct_capacity_wind"]

    wind_model = XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    wind_model.fit(X_train_wind, y_train_wind)

    wind_model_path = os.path.join(MODELS_DIR, "wind_model.pkl")
    joblib.dump(wind_model, wind_model_path)

    print("Model training complete!")

if __name__ == "__main__":
    train_forecasting_models()
