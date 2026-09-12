import os
import joblib
import numpy as np
import pandas as pd

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

SOLAR_FEATURES = ["irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
WIND_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

def run_model_verification():
    train_path = os.path.join(DATA_DIR, "train_data.csv")
    test_path = os.path.join(DATA_DIR, "test_data.csv")
    solar_model_path = os.path.join(MODELS_DIR, "solar_model.pkl")
    wind_model_path = os.path.join(MODELS_DIR, "wind_model.pkl")

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)
    solar_model = joblib.load(solar_model_path)
    wind_model = joblib.load(wind_model_path)

    print("================ MODEL INTEGRITY & SANITY CHECKS ================\n")

    # Check 1: Feature Correlations with Target
    print("--- Check 1: Feature Correlations with Target ---")
    solar_corr = train_df[SOLAR_FEATURES].corrwith(train_df["target_pct_capacity_solar"])
    print("Solar Feature Correlations:")
    print(solar_corr.round(4))
    
    wind_corr = train_df[WIND_FEATURES].corrwith(train_df["target_pct_capacity_wind"])
    print("\nWind Feature Correlations:")
    print(wind_corr.round(4))
    
    solar_max_corr = solar_corr.abs().max()
    wind_max_corr = wind_corr.abs().max()
    print(f"\nMax Solar Feature Correlation: {solar_max_corr:.4f}")
    print(f"Max Wind Feature Correlation:  {wind_max_corr:.4f}")
    if solar_max_corr > 0.99 or wind_max_corr > 0.99:
        print("[WARNING] Extremely high correlation detected (potential leakage)!")
    else:
        print("[PASSED] Feature correlations are in healthy, realistic ranges.")

    # Check 2: Timestamp Overlap
    print("\n--- Check 2: Timestamp Overlap Check ---")
    train_ts = set(train_df["timestamp"])
    test_ts = set(test_df["timestamp"])
    overlap = train_ts & test_ts
    print(f"Overlapping timestamps between Train and Test: {len(overlap)}")
    if len(overlap) == 0:
        print("[PASSED] Zero overlap between Train and Test sets.")
    else:
        print("[WARNING] Overlapping timestamps found!")

    # Check 3: Chronological Split Sequence
    print("\n--- Check 3: Chronological Sequence Check ---")
    max_train_ts = pd.to_datetime(train_df["timestamp"]).max()
    min_test_ts = pd.to_datetime(test_df["timestamp"]).min()
    print(f"Latest Train Timestamp:  {max_train_ts}")
    print(f"Earliest Test Timestamp: {min_test_ts}")
    if max_train_ts < min_test_ts:
        print("[PASSED] Strict chronological split confirmed (Train strictly precedes Test).")
    else:
        print("[WARNING] Train and Test timestamps are shuffled!")

    # Check 4: Feature Importance Ranking
    print("\n--- Check 4: Feature Importance Ranking ---")
    if hasattr(solar_model, "feature_importances_"):
        solar_imp = pd.Series(solar_model.feature_importances_, index=SOLAR_FEATURES).sort_values(ascending=False)
        print("Solar Model Feature Importances:")
        print(solar_imp.round(4))
    
    if hasattr(wind_model, "feature_importances_"):
        wind_imp = pd.Series(wind_model.feature_importances_, index=WIND_FEATURES).sort_values(ascending=False)
        print("\nWind Model Feature Importances:")
        print(wind_imp.round(4))

    # Check 5: Physics Baseline Comparison (Wind Cubic Power Curve vs ML Model)
    print("\n--- Check 5: Physics Baseline Sanity Check (Wind Model) ---")
    w_speed_test = test_df["wind_speed"]
    physics_wind_pred = np.clip(((w_speed_test - 3.0) / (12.0 - 3.0))**3, 0.0, 1.0)
    ml_wind_pred = wind_model.predict(test_df[WIND_FEATURES])
    y_true_wind = test_df["target_pct_capacity_wind"]

    physics_mae = np.mean(np.abs(physics_wind_pred - y_true_wind)) * 100.0
    ml_mae = np.mean(np.abs(ml_wind_pred - y_true_wind)) * 100.0
    print(f"Physics Naive Power Curve MAE: {physics_mae:.2f}% of capacity")
    print(f"ML Model MAE:                  {ml_mae:.2f}% of capacity")
    print("=================================================================\n")

if __name__ == "__main__":
    run_model_verification()
