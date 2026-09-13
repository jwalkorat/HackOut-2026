// 72-Hour Synthetic Forecast Data for MegaByte Renewable Forecasting Platform

export const generate72HourData = (siteType = 'hybrid') => {
  const hours = [];
  const now = new Date();
  now.setMinutes(0, 0, 0);
  
  for (let i = 0; i < 72; i++) {
    const timestamp = new Date(now.getTime() + i * 3600 * 1000);
    const hourOfDay = timestamp.getHours();
    const dayIndex = Math.floor(i / 24) + 1;
    
    // Solar generation profile (bell curve peaking at 13:00)
    let solarBase = 0;
    if (hourOfDay >= 6 && hourOfDay <= 19) {
      const peakDist = Math.abs(hourOfDay - 13);
      solarBase = Math.max(0, Math.cos((peakDist / 7) * (Math.PI / 2))) * 115;
      // Daily weather variance
      if (dayIndex === 2 && hourOfDay >= 11 && hourOfDay <= 15) {
        solarBase *= 0.55; // Simulated cloud cover dip on Day 2
      }
    }
    
    // Wind generation profile (gustier at night and late afternoon)
    const windSpeed = 6.5 + Math.sin(i * 0.28) * 3.8 + (Math.cos(i * 0.15) * 2.2);
    // Typical cubic power curve between cut-in (3 m/s) and rated (12 m/s)
    let windBase = 0;
    if (windSpeed >= 3 && windSpeed <= 25) {
      const normalizedSpeed = Math.min(1, Math.max(0, (windSpeed - 3) / 9.5));
      windBase = Math.pow(normalizedSpeed, 2.4) * 88;
    }
    
    // Grid baseline demand curve
    const demandBase = 85 + Math.sin((hourOfDay - 8) * (Math.PI / 12)) * 32 + (hourOfDay >= 17 && hourOfDay <= 21 ? 25 : 0);
    
    // Calculate total generation based on active site mode
    let actualGen = 0;
    if (siteType === 'solar') actualGen = solarBase;
    else if (siteType === 'wind') actualGen = windBase;
    else actualGen = (solarBase * 0.65) + (windBase * 0.7);

    // Weather factors
    const irradiance = Math.max(0, Math.round((solarBase / 115) * 980 + (Math.sin(i) * 25)));
    const ambientTemp = 18 + Math.round(Math.sin((hourOfDay - 9) * (Math.PI / 12)) * 9);
    const cloudCover = dayIndex === 2 && hourOfDay >= 11 && hourOfDay <= 15 ? 78 : Math.max(5, Math.round(15 + Math.sin(i * 0.4) * 18));
    
    // Surplus / Shortfall classification
    const netBalance = actualGen - demandBase;
    let flagStatus = 'balanced';
    let recommendation = 'Grid balanced — normal SCADA operation';
    let actionType = 'none';

    if (netBalance > 25) {
      flagStatus = 'surplus';
      recommendation = 'Surplus absorption: Charge BESS buffer';
      actionType = 'charge';
    } else if (netBalance < -20) {
      flagStatus = 'shortfall';
      recommendation = 'Shortfall deficit: Dispatch BESS reserve';
      actionType = 'discharge';
    }

    hours.push({
      hourOffset: i,
      timeLabel: `${timestamp.toLocaleDateString('en-US', { weekday: 'short' })} ${String(hourOfDay).padStart(2, '0')}:00`,
      dayLabel: `Day ${dayIndex}`,
      hourOfDay,
      solarGen: Math.round(solarBase * 10) / 10,
      windGen: Math.round(windBase * 10) / 10,
      totalGen: Math.round(actualGen * 10) / 10,
      demand: Math.round(demandBase * 10) / 10,
      netBalance: Math.round(netBalance * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      irradiance,
      ambientTemp,
      cloudCover,
      flagStatus,
      flag: flagStatus === 'surplus' ? 'OVER-GENERATION' : flagStatus === 'shortfall' ? 'UNDER-GENERATION' : 'BALANCED',
      recommendation,
      actionType,
      bessSoc: 65,
      bessChargeKw: netBalance > 25 ? Math.round(netBalance * 1000) : 0,
      bessDischargeKw: netBalance < -20 ? Math.round(Math.abs(netBalance) * 1000) : 0,
    });
  }
  
  return hours;
};

// Initial Flagged Grid Imbalance Windows for Actions Tab
export const flaggedActionWindows = [
  {
    id: 'ACT-2026-081',
    timeframe: 'Tomorrow 11:00 → 15:00 (4h)',
    type: 'surplus',
    actionType: 'charge',
    excessCapacity: '+38.4 MW',
    rootCause: 'High solar irradiance (940 W/m²) combined with thermal breeze exceeding industrial baseline load.',
    recommendation: 'Surplus absorption: Ramp up BESS charging rate to 18 MW; prime thermal storage chillers.',
    actionButton: 'Dispatch BESS Charging',
    co2Saved: '42.8 Tons',
    severity: 'critical',
    status: 'Action Required',
    resolved: false
  },
  {
    id: 'ACT-2026-082',
    timeframe: 'Today 18:30 → 21:00 (2.5h)',
    type: 'shortfall',
    actionType: 'discharge',
    excessCapacity: '-29.1 MW',
    rootCause: 'Twilight solar drop coupled with low rotor speeds (wind below 4.2 m/s) and evening residential peak load.',
    recommendation: 'Generation shortfall: Discharge BESS reserve at 22 MW; signal commercial demand response.',
    actionButton: 'Discharge BESS Storage',
    co2Saved: 'Grid Stability',
    severity: 'high',
    status: 'Action Required',
    resolved: false
  },
  {
    id: 'ACT-2026-083',
    timeframe: 'Day 3 01:00 → 05:00 (4h)',
    type: 'surplus',
    actionType: 'charge',
    excessCapacity: '+24.5 MW',
    rootCause: 'Nighttime wind surge with low valley demand. Transmission interconnection near thermal rating.',
    recommendation: 'Night wind surplus: Absorb in long-duration BESS; prepare green hydrogen electrolyzer.',
    actionButton: 'Engage Auxiliary Load',
    co2Saved: '31.2 Tons',
    severity: 'medium',
    status: 'Scheduled',
    resolved: false
  }
];
