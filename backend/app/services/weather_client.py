import time
import requests
import numpy as np
import pandas as pd

def fetch_live_weather_forecast(latitude: float, longitude: float, forecast_days: int = 3):
    """Fetch live 24-72 hour weather forecast from Open-Meteo API."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "shortwave_radiation,cloud_cover,temperature_2m,wind_speed_10m",
        "forecast_days": forecast_days,
        "windspeed_unit": "ms",
        "timezone": "auto"
    }

    for attempt in range(3):
        try:
            res = requests.get(url, params=params, timeout=8)
            res.raise_for_status()
            data = res.json()
            hourly = data["hourly"]
            
            df_weather = pd.DataFrame({
                "timestamp": pd.to_datetime(hourly["time"]),
                "irradiance": hourly["shortwave_radiation"],
                "cloud_cover": hourly["cloud_cover"],
                "temperature": hourly["temperature_2m"],
                "wind_speed": hourly["wind_speed_10m"]
            })
            return df_weather, "live"
        except Exception as e:
            print(f"Open-Meteo Live API attempt {attempt+1} failed: {e}. Retrying...")
            time.sleep(1)

    # B3 Fix: Return source flag so caller can surface this to the API response
    # instead of silently returning synthetic data that looks like a normal 200.
    print("Live Open-Meteo API unavailable. Generating realistic live forecast baseline...")
    now = pd.Timestamp.now().floor("h")
    dates = pd.date_range(start=now, periods=forecast_days * 24, freq="h")
    hours = dates.hour
    day_of_year = dates.dayofyear

    solar_base = np.maximum(0, np.sin((hours - 6) * np.pi / 12)) * 920.0
    season_factor = 1.0 + 0.15 * np.cos(2 * np.pi * (day_of_year - 172) / 365)
    cloud_cover = np.clip(np.random.normal(25, 15, len(dates)), 0, 100)
    irradiance = np.clip(solar_base * season_factor * (1.0 - cloud_cover / 120.0), 0, 1100)

    temperature = 26.0 + 6.0 * np.sin((hours - 9) * np.pi / 12) + np.random.normal(0, 1.0, len(dates))
    wind_speed = np.clip(6.5 + 2.5 * np.sin((hours - 14) * np.pi / 12) + np.random.normal(0, 1.5, len(dates)), 0.5, 25.0)

    return pd.DataFrame({
        "timestamp": dates,
        "irradiance": irradiance,
        "cloud_cover": cloud_cover,
        "temperature": temperature,
        "wind_speed": wind_speed
    }), "synthetic_fallback"
