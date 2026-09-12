import numpy as np
import pandas as pd

SOLAR_FEATURES = ["solar_physics_proxy", "irradiance", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
SOLAR_EXTENDED_FEATURES = ["solar_physics_proxy", "irradiance", "irradiance_sq", "cloud_cover", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]
WIND_FEATURES = ["wind_speed", "temperature", "hour_sin", "hour_cos", "doy_sin", "doy_cos"]

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_year"] = df["timestamp"].dt.dayofyear
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24.0)
    df["doy_sin"] = np.sin(2 * np.pi * df["day_of_year"] / 365.0)
    df["doy_cos"] = np.cos(2 * np.pi * df["day_of_year"] / 365.0)
    return df

def prepare_solar_features(df_weather: pd.DataFrame, feature_set: list = SOLAR_FEATURES) -> pd.DataFrame:
    df = df_weather.copy()
    df = add_time_features(df)
    # Open-Meteo shortwave_radiation is surface GHI which already incorporates cloud attenuation.
    # Using irradiance / 1000.0 directly avoids double-discounting cloud cover.
    df["solar_physics_proxy"] = df["irradiance"] / 1000.0
    df["irradiance_sq"] = (df["irradiance"] / 1000.0) ** 2
    return df[feature_set]

def prepare_wind_features(df_weather: pd.DataFrame) -> pd.DataFrame:
    df = df_weather.copy()
    df = add_time_features(df)
    return df[WIND_FEATURES]
