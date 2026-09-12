import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")

SOLAR_FEATURES = ["solar_physics_proxy", "irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
WIND_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

def run_backtest():
    test_path = os.path.join(DATA_DIR, "test_data.csv")
    solar_model_path = os.path.join(MODELS_DIR, "solar_model.pkl")
    wind_model_path = os.path.join(MODELS_DIR, "wind_model.pkl")

    test_df = pd.read_csv(test_path)
    test_df["solar_physics_proxy"] = (test_df["irradiance"] / 1000.0) * (1.0 - test_df["cloud_cover"] / 100.0 * 0.7)

    solar_model = joblib.load(solar_model_path)
    wind_model = joblib.load(wind_model_path)

    # 1. Backtest Solar Model
    X_test_solar = test_df[SOLAR_FEATURES]
    y_true_solar = test_df["target_pct_capacity_solar"]
    y_pred_solar = np.clip(solar_model.predict(X_test_solar), 0.0, 1.0)

    solar_mae_pct = np.mean(np.abs(y_pred_solar - y_true_solar)) * 100.0
    solar_active_mask = y_true_solar >= 0.05
    solar_mape = np.mean(np.abs((y_true_solar[solar_active_mask] - y_pred_solar[solar_active_mask]) / y_true_solar[solar_active_mask])) * 100.0

    # 2. Backtest Wind Model
    X_test_wind = test_df[WIND_FEATURES]
    y_true_wind = test_df["target_pct_capacity_wind"]
    y_pred_wind = np.clip(wind_model.predict(X_test_wind), 0.0, 1.0)

    wind_mae_pct = np.mean(np.abs(y_pred_wind - y_true_wind)) * 100.0
    wind_active_mask = y_true_wind >= 0.05
    wind_mape = np.mean(np.abs((y_true_wind[wind_active_mask] - y_pred_wind[wind_active_mask]) / y_true_wind[wind_active_mask])) * 100.0

    # Save Charts
    plot_window = min(168, len(test_df))
    timestamps = pd.to_datetime(test_df["timestamp"][:plot_window])

    plt.figure(figsize=(12, 5))
    plt.plot(timestamps, y_true_solar[:plot_window] * 100, label="Actual Solar (% Capacity)", color="#f59e0b", linewidth=2)
    plt.plot(timestamps, y_pred_solar[:plot_window] * 100, label="Predicted Solar (% Capacity)", color="#3b82f6", linestyle="--", linewidth=2)
    plt.title("Physics-Informed Solar Generation Backtest: Predicted vs Actual", fontsize=14, fontweight="bold")
    plt.xlabel("Timestamp", fontsize=11)
    plt.ylabel("% of Installed Capacity", fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "backtest_chart_solar.png"), dpi=300)
    plt.close()

    plt.figure(figsize=(12, 5))
    plt.plot(timestamps, y_true_wind[:plot_window] * 100, label="Actual Wind (% Capacity)", color="#10b981", linewidth=2)
    plt.plot(timestamps, y_pred_wind[:plot_window] * 100, label="Predicted Wind (% Capacity)", color="#6366f1", linestyle="--", linewidth=2)
    plt.title("Wind Generation Backtest: Predicted vs Actual", fontsize=14, fontweight="bold")
    plt.xlabel("Timestamp", fontsize=11)
    plt.ylabel("% of Installed Capacity", fontsize=11)
    plt.grid(True, alpha=0.3)
    plt.legend(fontsize=11)
    plt.tight_layout()
    plt.savefig(os.path.join(MODELS_DIR, "backtest_chart_wind.png"), dpi=300)
    plt.close()

    print("\n================ OFFICIAL REFINED BACKTEST SUMMARY ================")
    print(f"Refined Solar Model MAE: {solar_mae_pct:.2f}% of capacity | MAPE: {solar_mape:.2f}%")
    print(f"Wind Model MAE:          {wind_mae_pct:.2f}% of capacity | MAPE: {wind_mape:.2f}%")
    print("===================================================================\n")

if __name__ == "__main__":
    run_backtest()
