/**
 * Helper utilities for interacting with the Renewable Generation Forecasting API
 */

/**
 * Geocodes a free-text location name via the backend /api/geocode endpoint.
 * Returns { latitude, longitude, display } or null on failure.
 * @param {string} locationText
 * @returns {Promise<{latitude: number, longitude: number, display: string}|null>}
 */
export async function geocodeLocation(locationText) {
  if (!locationText || locationText.trim().length < 2) return null;
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationText.trim())}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      return { latitude: r.latitude, longitude: r.longitude, display: r.display };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses a site profile into a ForecastRequest payload for the FastAPI backend.
 * @param {Object} site - The site profile from siteProfiles.js
 * @returns {Object} The request payload
 */
export function mapSiteToApiRequest(site) {
  // 1. Parse Coordinates
  // Example: '35.0110° N, 115.4734° W' -> lat: 35.0110, lon: -115.4734
  const coordRegex = /([\d.]+)\s*°\s*([NS]),\s*([\d.]+)\s*°\s*([EW])/;
  const match = site.coordinates.match(coordRegex);

  let lat = 23.0225; // Default
  let lon = 72.5714; // Default

  if (match) {
    lat = parseFloat(match[1]);
    if (match[2] === 'S') lat *= -1;
    lon = parseFloat(match[3]);
    if (match[4] === 'W') lon *= -1;
  }

  // 2. Parse Installed Capacity
  // Example: '120 MWp' -> 120000 kW
  const capMatch = site.installedCapacity.match(/([\d.]+)\s*MW/);
  let capacityKw = 75.0;
  if (capMatch) capacityKw = parseFloat(capMatch[1]) * 1000;

  // 3. Parse Battery
  const batMatch = site.storageCapacity
    ? site.storageCapacity.match(/([\d.]+)\s*MWh/)
    : null;
  const batteryKwh = batMatch ? parseFloat(batMatch[1]) * 1000 : 0;

  // 4. Map Energy Type
  const energyTypeMap = { solar: 'solar', wind: 'wind', hybrid: 'both' };

  return {
    location: { latitude: lat, longitude: lon },
    energy_type: energyTypeMap[site.energyType] || 'solar',
    installed_capacity_kw: capacityKw,
    equipment_model: 'Generic',
    equipment_model_wind: 'Generic',
    demand: {
      category: site.energyType === 'hybrid' ? 'commercial' : 'industrial',
      known_avg_kw: capacityKw * 0.4,
    },
    storage: {
      has_battery: batteryKwh > 0,
      battery_capacity_kwh: batteryKwh,
      battery_current_pct: site.storageSOC || 50,
      has_backup_generator: true,
    },
    forecast_hours: 72,
  };
}

/**
 * Builds a ForecastRequest payload from the ConfigTab form state.
 *
 * @param {Object} config - Fields collected from the Config UI form
 * @param {number} config.latitude
 * @param {number} config.longitude
 * @param {string} config.energyType   - 'solar' | 'wind' | 'hybrid'
 * @param {number} config.capacityKw   - installed capacity in kW
 * @param {number} config.demandKw     - average demand in kW
 * @param {string} [config.solarPanelId]   - equipment_model for solar
 * @param {string} [config.windTurbineId]  - equipment_model_wind
 * @param {number} [config.tiltAngleDeg]   - array tilt angle
 * @param {number} [config.hubHeightM]     - turbine hub height (m)
 * @param {number} [config.batteryKwh]     - BESS capacity (kWh)
 * @param {number} [config.batterySOC]     - current SOC (%)
 * @param {boolean} [config.hasBackupGen]
 * @returns {Object} ForecastRequest payload
 */
export function mapConfigToApiRequest(config) {
  const energyTypeMap = { solar: 'solar', wind: 'wind', hybrid: 'both' };

  const payload = {
    location: {
      latitude: config.latitude,
      longitude: config.longitude,
    },
    energy_type: energyTypeMap[config.energyType] || 'solar',
    installed_capacity_kw: config.capacityKw,
    equipment_model: config.solarPanelId || 'Generic',
    equipment_model_wind: config.windTurbineId || 'Generic',
    demand: {
      known_avg_kw: config.demandKw > 0 ? config.demandKw : undefined,
    },
    storage: {
      has_battery: (config.batteryKwh || 0) > 0,
      battery_capacity_kwh: config.batteryKwh || 0,
      battery_current_pct: config.batterySOC || 50,
      has_backup_generator: config.hasBackupGen ?? true,
    },
    forecast_hours: 72,
  };

  // Only include optional physics params if explicitly provided
  if (config.tiltAngleDeg != null) payload.tilt_angle_deg = config.tiltAngleDeg;
  if (config.hubHeightM    != null) payload.hub_height_m  = config.hubHeightM;

  return payload;
}

/**
 * Transforms the API response forecast array into the format expected by frontend components.
 * @param {Array}  forecast    - The 'forecast' array from the API response
 * @param {string} energyType  - The energy type from the API response root ('solar'|'wind'|'both')
 * @returns {Array} Transformed forecast data
 */
export function transformApiResponse(forecast, energyType) {
  return forecast.map((item, idx) => {
    // Map API flag → frontend flagStatus
    let flagStatus = 'balanced';
    if (item.flag === 'OVER-GENERATION')  flagStatus = 'surplus';
    else if (item.flag === 'UNDER-GENERATION') flagStatus = 'shortfall';

    // API returns kW; frontend charts expect MW
    const totalMW  = item.predicted_kw / 1000;
    const demandMW = item.demand_kw / 1000;

    // Use the physics-corrected solar/wind breakdown from the API response
    // API now provides solar_kw and wind_kw separately per time step
    const solarMW = (item.solar_kw != null ? item.solar_kw : 0) / 1000;
    const windMW  = (item.wind_kw  != null ? item.wind_kw  : 0) / 1000;

    return {
      hourOffset:  idx,
      timeLabel:   item.timestamp.replace('T', ' ').substring(0, 16),
      dayLabel:    `Day ${Math.floor(idx / 24) + 1}`,
      solarGen:    Math.round(solarMW * 1000) / 1000,
      windGen:     Math.round(windMW  * 1000) / 1000,
      totalGen:    Math.round(totalMW * 1000) / 1000,
      demand:      Math.round(demandMW * 1000) / 1000,
      netBalance:  Math.round((totalMW - demandMW) * 1000) / 1000,
      flagStatus,
      windSpeed:   item.weather.wind_speed,
      irradiance:  item.weather.irradiance,
      ambientTemp: item.weather.temperature,
      cloudCover:  item.weather.cloud_cover,
    };
  });
}

