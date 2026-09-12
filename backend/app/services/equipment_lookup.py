import os
import json

PRESETS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "equipment_presets.json")

def load_equipment_presets():
    if not os.path.exists(PRESETS_FILE):
        return {"solar_panels": [], "wind_turbines": []}
    with open(PRESETS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def get_equipment_spec(model_name: str, energy_type: str = "solar"):
    presets = load_equipment_presets()
    key = "solar_panels" if energy_type == "solar" else "wind_turbines"
    
    for item in presets.get(key, []):
        if item.get("model").lower() == model_name.lower() or item.get("id").lower() == model_name.lower():
            return item
            
    # Fallback to Generic
    for item in presets.get(key, []):
        if "generic" in item.get("id", "").lower():
            return item
            
    return {"efficiency_pct": 20.0, "rated_power_w": 400}
