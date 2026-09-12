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
    name_lower = model_name.lower()

    # Match on id, model string, or brand — in that priority order
    for item in presets.get(key, []):
        if (item.get("id", "").lower() == name_lower
                or item.get("model", "").lower() == name_lower
                or item.get("brand", "").lower() == name_lower):
            return item

    # Partial-match fallback: search string contains field or field contains search string
    for item in presets.get(key, []):
        if "generic" in item.get("id", "").lower():
            continue  # skip generic in partial-match round
        id_val    = item.get("id", "").lower()
        model_val = item.get("model", "").lower()
        brand_val = item.get("brand", "").lower()
        if (name_lower in id_val or id_val in name_lower
                or name_lower in model_val or model_val in name_lower
                or name_lower in brand_val or brand_val in name_lower):
            return item

    # Final fallback to Generic
    for item in presets.get(key, []):
        if "generic" in item.get("id", "").lower():
            return item

    return {"efficiency_pct": 20.0, "rated_power_w": 400}
