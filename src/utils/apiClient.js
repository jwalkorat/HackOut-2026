// ─────────────────────────────────────────────────────────────────────────────
// apiClient.js  — MegaByte frontend ↔ backend bridge
// All data on the dashboard ultimately flows through here.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// ── Geocode a free-text location name → { latitude, longitude, display } ─────
// Calls Open-Meteo geocoding API directly — no backend needed for this step.
export async function geocodeLocation(text) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding service returned ${res.status}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('No location found — try a more specific name');
  const r = data.results[0];
  return {
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    display: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
  };
}

// ── Map frontend userConfig → backend ForecastRequest body ───────────────────
function buildRequestBody(cfg) {
  // cfg shape (from ConfigView):
  // { location (text), latitude, longitude, energyType, installedCapacityMw,
  //   demandMw, selectedPanel, selectedTurbine, tiltAngle, hubHeight,
  //   batteryCapacity, batterySOC, backupCapacity }

  const energyTypeMap = { solar: 'solar', wind: 'wind', hybrid: 'both' };

  return {
    location: {
      latitude: cfg.latitude ?? 23.0225,
      longitude: cfg.longitude ?? 72.5714,
    },
    energy_type: energyTypeMap[cfg.energyType] ?? 'solar',
    installed_capacity_kw: (parseFloat(cfg.installedCapacityMw) || 75) * 1000,

    // Equipment
    equipment_model: cfg.selectedPanel ?? 'Generic',
    equipment_model_wind: cfg.selectedTurbine ?? 'Generic',

    // Layer 2 precision params
    tilt_angle_deg: cfg.tiltAngle ? parseFloat(cfg.tiltAngle) : null,
    hub_height_m: cfg.hubHeight ? parseFloat(cfg.hubHeight) : null,

    // Demand
    demand: cfg.demandMw
      ? { known_avg_kw: (parseFloat(cfg.demandMw) || 0) * 1000, category: null }
      : null,

    // Storage (battery)
    storage: {
      has_battery: Boolean(cfg.batteryCapacity && parseFloat(cfg.batteryCapacity) > 0),
      battery_capacity_kwh: (parseFloat(cfg.batteryCapacity) || 0) * 1000,
      battery_current_pct: parseFloat(cfg.batterySOC) || 50,
      has_backup_generator: Boolean(cfg.backupCapacity && parseFloat(cfg.backupCapacity) > 0),
    },

    forecast_hours: 72,
  };
}

// ── Transform one API forecast item → frontend row shape ─────────────────────
function transformItem(item, index) {
  const ts = new Date(item.timestamp);
  const hourOfDay = ts.getHours();
  const dayIndex = Math.floor(index / 24) + 1;

  // Convert kW → MW for display (keep 1 decimal)
  const toMw = (kw) => Math.round((kw / 1000) * 10) / 10;

  // Backend returns uppercase: 'OVER-GENERATION', 'UNDER-GENERATION', 'BALANCED'
  const flagMap = {
    'OVER-GENERATION': 'surplus',
    'UNDER-GENERATION': 'shortfall',
    'BALANCED': 'balanced',
  };

  // Map recommendation text → canonical action type for UI badges
  const rec = item.recommended_action ?? '';
  let actionType = 'none';
  if (rec.toLowerCase().includes('curtail')) actionType = 'curtail';
  else if (rec.toLowerCase().includes('charge battery')) actionType = 'charge';
  else if (rec.toLowerCase().includes('discharge battery')) actionType = 'discharge';
  else if (rec.toLowerCase().includes('activate backup')) actionType = 'backup';

  const rawFlag = item.flag ?? 'BALANCED';
  return {
    hourOffset: index,
    timeLabel: ts.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
      String(hourOfDay).padStart(2, '0') + ':00',
    dayLabel: `Day ${dayIndex}`,
    hourOfDay,
    // Generation in MW
    solarGen: toMw(item.solar_kw ?? 0),
    windGen: toMw(item.wind_kw ?? 0),
    totalGen: toMw(item.predicted_kw ?? 0),
    // Demand in MW
    demand: toMw(item.demand_kw ?? 0),
    netBalance: toMw((item.predicted_kw ?? 0) - (item.demand_kw ?? 0)),
    // Weather
    windSpeed: item.weather?.wind_speed ?? 0,
    irradiance: item.weather?.irradiance ?? 0,
    ambientTemp: item.weather?.temperature ?? 0,
    cloudCover: item.weather?.cloud_cover ?? 0,
    // Flag & recommendation
    flagStatus: flagMap[rawFlag] ?? 'balanced',
    flag: rawFlag,
    recommendation: rec,
    actionType,
    bessSoc:         item.bess_soc_pct      ?? null,
    bessChargeKw:    item.bess_charge_kw    ?? null,
    bessDischargeKw: item.bess_discharge_kw ?? null,
  };
}

// ── POST /api/forecast and return transformed data ────────────────────────────
export async function postForecast(userConfig) {
  const body = buildRequestBody(userConfig);

  const res = await fetch(`${BASE_URL}/api/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Forecast request failed (${res.status})`);
  }

  const data = await res.json();

  // Transform forecast array
  const forecastData = (data.forecast ?? []).map(transformItem);

  // Derive flagged windows from forecast rows
  const flaggedWindows = deriveFlaggedWindows(forecastData, data);

  return {
    forecastData,       // transformed hourly rows
    flaggedWindows,     // grouped surplus/shortfall events
    meta: {
      generatedAt: data.generated_at,
      weatherSource: data.weather_data_source,
      energyType: data.energy_type,
      installedCapacityKw: data.installed_capacity_kw,
      totalForecastedKwh: data.total_forecasted_kwh,
      peakGenerationKw: data.peak_generation_kw,
      equipment: data.equipment,
      physicsCorrections: data.physics_corrections,
    },
  };
}

// ── Group consecutive flagged rows into flagged event windows ─────────────────
function deriveFlaggedWindows(rows, rawData) {
  const windows = [];
  let current = null;
  let flagIdCounter = 1;

  for (const row of rows) {
    if (row.flagStatus !== 'balanced') {
      // Group by flagStatus and actionType so BESS charging vs Inverter Curtailment are distinct operational windows
      const groupKey = `${row.flagStatus}_${row.actionType}`;
      if (!current || current.groupKey !== groupKey) {
        if (current) windows.push(current);
        current = {
          id: `FL-${String(flagIdCounter++).padStart(4, '0')}`,
          groupKey,
          type: row.flagStatus,
          actionType: row.actionType,
          severity: Math.abs(row.netBalance) > 20 ? 'critical' : Math.abs(row.netBalance) > 10 ? 'high' : 'medium',
          startTime: row.timeLabel,
          endTime: row.timeLabel,
          startOffset: row.hourOffset,
          endOffset: row.hourOffset,
          rows: [row],
          peakDelta: row.netBalance,
          resolved: false,
        };
      } else {
        current.endTime = row.timeLabel;
        current.endOffset = row.hourOffset;
        current.rows.push(row);
        if (Math.abs(row.netBalance) > Math.abs(current.peakDelta)) {
          current.peakDelta = row.netBalance;
        }
      }
    } else {
      if (current) { windows.push(current); current = null; }
    }
  }
  if (current) windows.push(current);

  // Enrich each window with title, root cause, and specific operational action
  return windows.map((w) => {
    const hrs = w.endOffset - w.startOffset + 1;
    const sign = w.type === 'surplus' ? '+' : '';
    const peakMw = `${sign}${w.peakDelta.toFixed(1)} MW`;

    const rec = w.rows.find((r) => r.recommendation)?.recommendation ?? '';
    const isCurtail = w.actionType === 'curtail' || rec.toLowerCase().includes('curtail');
    const isCharge = w.actionType === 'charge' || rec.toLowerCase().includes('charge');
    const isDischarge = w.actionType === 'discharge' || rec.toLowerCase().includes('discharge');
    const isBackup = w.actionType === 'backup' || rec.toLowerCase().includes('activate backup');

    let title = 'Over-Generation Surplus Window';
    let actionButton = 'Dispatch BESS Charging';
    let rootCause = `Forecasted generation exceeds demand by up to ${peakMw} over ${hrs}h.`;

    if (w.type === 'surplus') {
      if (isCurtail) {
        title = 'Over-Generation Curtailment Window (BESS Full)';
        actionButton = 'Execute Curtailment Order';
        rootCause = `Surplus of up to ${peakMw} exceeds storage capacity (BESS fully charged at ≥95% or unavailable). Inverter active curtailment required to maintain grid frequency.`;
      } else {
        title = 'Over-Generation Surplus Window (BESS Charging)';
        actionButton = 'Dispatch BESS Charging';
        rootCause = `Renewable generation exceeds demand by up to ${peakMw}. Directing excess energy to recharge BESS storage bank.`;
      }
    } else { // shortfall
      if (isDischarge) {
        title = 'Generation Shortfall Deficit (BESS Discharge)';
        actionButton = 'Discharge BESS Storage';
        rootCause = `Generation falls short of load by up to ${peakMw}. Dispatching BESS storage reserve to bridge balancing shortfall.`;
      } else if (isBackup) {
        title = 'Generation Shortfall Deficit (Backup Peaker)';
        actionButton = 'Activate Backup Generator';
        rootCause = `Shortfall of up to ${peakMw} exceeds available BESS reserve (battery depleted to ≤15%). Activating backup generator to prevent unserved energy.`;
      } else {
        title = 'Generation Shortfall Window (No Buffer)';
        actionButton = 'Issue Grid Shortfall Alert';
        rootCause = `Deficit of up to ${peakMw} over ${hrs}h without storage buffer. Regional load-balancing notification required.`;
      }
    }

    return {
      ...w,
      title,
      timeframe: `${w.startTime} → ${w.endTime} (${hrs}h)`,
      excessCapacity: peakMw,
      rootCause,
      recommendation: rec,
      actionButton,
      co2Saved: w.type === 'surplus' ? `${Math.abs(w.peakDelta * hrs * 0.49).toFixed(1)} Tons` : 'Grid Stability',
      status: 'Action Required',
    };
  });
}
