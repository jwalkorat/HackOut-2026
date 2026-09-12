import numpy as np
import pandas as pd

SOLAR_FEATURES = ["solar_physics_proxy", "irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
WIND_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_year"] = df["timestamp"].dt.dayofyear
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)
    df["doy_sin"] = np.sin(2 * np.pi * df["day_of_year"] / 365.0)
    df["doy_cos"] = np.cos(2 * np.pi * df["day_of_year"] / 365.0)
    return df

def prepare_solar_features(df_weather: pd.DataFrame) -> pd.DataFrame:
    df = df_weather.copy()
    df = add_time_features(df)
    df["solar_physics_proxy"] = (df["irradiance"] / 1000.0) * (1.0 - 0.7 * (df["cloud_cover"] / 100.0))
    return df[SOLAR_FEATURES]

def prepare_wind_features(df_weather: pd.DataFrame) -> pd.DataFrame:
    df = df_weather.copy()
    df = add_time_features(df)
    return df[WIND_FEATURES]
