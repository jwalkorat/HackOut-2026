import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
try:
    from xgboost import XGBRegressor
    USE_XGB = True
except ImportError:
    USE_XGB = False

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

def run_cloudy_diagnostics_and_refinement():
    train_df = pd.read_csv(os.path.join(DATA_DIR, "train_data.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test_data.csv"))
    solar_model = joblib.load(os.path.join(MODELS_DIR, "solar_model.pkl"))

    # SOLAR DIAGNOSTIC ON CLOUDY HOURS
    # Daylight hours: 8 AM to 4 PM (hours 8 to 16)
    daylight_test = test_df[(test_df["hour"] >= 8) & (test_df["hour"] <= 16)].copy()
    
    # Unusually cloudy daylight hours (cloud_cover > 50% or low irradiance for midday)
    cloudy_test = daylight_test[daylight_test["cloud_cover"] > 50.0].copy()
    clear_test = daylight_test[daylight_test["cloud_cover"] <= 50.0].copy()

    SOLAR_FEATURES_ORIG = ["irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

    y_pred_all = np.clip(solar_model.predict(test_df[SOLAR_FEATURES_ORIG]), 0.0, 1.0)
    y_pred_cloudy = np.clip(solar_model.predict(cloudy_test[SOLAR_FEATURES_ORIG]), 0.0, 1.0)
    y_pred_clear = np.clip(solar_model.predict(clear_test[SOLAR_FEATURES_ORIG]), 0.0, 1.0)

    mae_all = np.mean(np.abs(y_pred_all - test_df["target_pct_capacity_solar"])) * 100.0
    mae_cloudy = np.mean(np.abs(y_pred_cloudy - cloudy_test["target_pct_capacity_solar"])) * 100.0
    mae_clear = np.mean(np.abs(y_pred_clear - clear_test["target_pct_capacity_solar"])) * 100.0

    print("================ SOLAR MODEL CLOUDY DAY DIAGNOSTICS ================")
    print(f"Overall Solar MAE (All Hours):          {mae_all:.2f}% of capacity")
    print(f"Clear Daytime Hours MAE (Cloud <= 50%):   {mae_clear:.2f}% of capacity")
    print(f"Cloudy Daytime Hours MAE (Cloud > 50%):  {mae_cloudy:.2f}% of capacity")
    print("===================================================================\n")

    # REFINE SOLAR MODEL: Feature Engineering with Physics Solar Proxy
    # By providing physical solar yield proxy = (irradiance / 1000) * (1 - cloud_cover / 100)
    print("--- REFINING SOLAR MODEL (Physics-Informed Features) ---")
    for df in [train_df, test_df]:
        df["solar_physics_proxy"] = (df["irradiance"] / 1000.0) * (1.0 - df["cloud_cover"] / 100.0 * 0.7)

    SOLAR_FEATURES_REFINED = ["solar_physics_proxy", "irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

    if USE_XGB:
        refined_solar_model = XGBRegressor(n_estimators=300, max_depth=4, learning_rate=0.03, subsample=0.85, colsample_bytree=0.85, random_state=42)
    else:
        refined_solar_model = HistGradientBoostingRegressor(max_iter=300, max_depth=4, learning_rate=0.03, random_state=42)

    refined_solar_model.fit(train_df[SOLAR_FEATURES_REFINED], train_df["target_pct_capacity_solar"])

    # Re-evaluate refined solar model
    y_pred_refined_all = np.clip(refined_solar_model.predict(test_df[SOLAR_FEATURES_REFINED]), 0.0, 1.0)
    y_pred_refined_cloudy = np.clip(refined_solar_model.predict(test_df[(test_df["hour"] >= 8) & (test_df["hour"] <= 16) & (test_df["cloud_cover"] > 50.0)][SOLAR_FEATURES_REFINED]), 0.0, 1.0)
    
    mae_refined_all = np.mean(np.abs(y_pred_refined_all - test_df["target_pct_capacity_solar"])) * 100.0
    mae_refined_cloudy = np.mean(np.abs(y_pred_refined_cloudy - test_df[(test_df["hour"] >= 8) & (test_df["hour"] <= 16) & (test_df["cloud_cover"] > 50.0)]["target_pct_capacity_solar"])) * 100.0

    print("Refined Solar Model Results:")
    print(f"Refined Overall Solar MAE:   {mae_refined_all:.2f}% of capacity")
    print(f"Refined Cloudy Hours Solar MAE: {mae_refined_cloudy:.2f}% of capacity")

    if hasattr(refined_solar_model, "feature_importances_"):
        solar_imp_ref = pd.Series(refined_solar_model.feature_importances_, index=SOLAR_FEATURES_REFINED).sort_values(ascending=False)
        print("\nRefined Solar Feature Importances:")
        print((solar_imp_ref * 100).round(2))

    # Save Refined Solar Model
    joblib.dump(refined_solar_model, os.path.join(MODELS_DIR, "solar_model.pkl"))

    # REFINE WIND MODEL: Hybrid Physics + ML Residual Architecture
    print("\n--- REFINING WIND MODEL (Hybrid Physics + ML Residual) ---")
    # Physics wind power curve baseline:
    # Power = clip(((wind_speed - 3.0) / (12.0 - 3.0))^3, 0, 1)
    train_df["wind_physics_base"] = np.clip(((train_df["wind_speed"] - 3.0) / (12.0 - 3.0))**3, 0.0, 1.0)
    test_df["wind_physics_base"] = np.clip(((test_df["wind_speed"] - 3.0) / (12.0 - 3.0))**3, 0.0, 1.0)

    # Residual = actual - physics_base
    train_df["wind_residual"] = train_df["target_pct_capacity_wind"] - train_df["wind_physics_base"]

    WIND_RESIDUAL_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
    
    if USE_XGB:
        wind_residual_model = XGBRegressor(n_estimators=200, max_depth=3, learning_rate=0.03, random_state=42)
    else:
        wind_residual_model = HistGradientBoostingRegressor(max_iter=200, max_depth=3, learning_rate=0.03, random_state=42)

    wind_residual_model.fit(train_df[WIND_RESIDUAL_FEATURES], train_df["wind_residual"])

    # Hybrid Prediction = Physics Base + ML Residual
    physics_pred_test = test_df["wind_physics_base"]
    residual_pred_test = wind_residual_model.predict(test_df[WIND_RESIDUAL_FEATURES])
    hybrid_wind_pred = np.clip(physics_pred_test + residual_pred_test, 0.0, 1.0)

    hybrid_wind_mae = np.mean(np.abs(hybrid_wind_pred - test_df["target_pct_capacity_wind"])) * 100.0
    print(f"Physics Baseline MAE:       {np.mean(np.abs(physics_pred_test - test_df['target_pct_capacity_wind'])) * 100.0:.3f}%")
    print(f"Hybrid Physics+ML Wind MAE: {hybrid_wind_mae:.3f}% of capacity")
    print("===================================================================\n")

if __name__ == "__main__":
    run_cloudy_diagnostics_and_refinement()
