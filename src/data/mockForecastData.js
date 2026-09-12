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
    if (netBalance > 28) flagStatus = 'surplus'; // Over-generation risk
    else if (netBalance < -25) flagStatus = 'shortfall'; // Under-generation risk

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
      windSpeed: Math.max(1.2, Math.round(windSpeed * 10) / 10),
      irradiance,
      ambientTemp,
      cloudCover,
      flagStatus,
    });
  }
  return hours;
};

export const flaggedWindowsMock = [
  {
    id: 'FL-2026-01',
    type: 'surplus',
    severity: 'high',
    title: 'Solar & Wind Super-Peak Over-Generation',
    timeframe: 'Tomorrow, 11:30 - 15:00 (3.5 hrs)',
    excessCapacity: '+42.8 MW',
    rootCause: 'Unusually low regional demand coinciding with clear midday irradiance (920 W/m²) and sustained wind gusts (11.2 m/s).',
    recommendation: 'Dispatch BESS Storage (Charge 35 MW) & Stage 1 Dynamic Curtailment (7.8 MW)',
    actionType: 'storage_charge',
    actionButton: 'Dispatch BESS Charging',
    co2Saved: '14.2 Tons',
    status: 'Action Required',
    resolved: false,
  },
  {
    id: 'FL-2026-02',
    type: 'shortfall',
    severity: 'critical',
    title: 'Evening Peak Demand Solar Dropoff',
    timeframe: 'Day 2, 18:00 - 21:30 (3.5 hrs)',
    excessCapacity: '-38.4 MW',
    rootCause: 'Simultaneous twilight solar descent and unexpected thermal wind lull (drop to 2.8 m/s) against 114 MW residential grid load.',
    recommendation: 'Discharge BESS Storage (30 MW) & Pre-warm Hydro-Reserve / Fast-start Peaker (8.4 MW)',
    actionType: 'storage_discharge',
    actionButton: 'Discharge BESS & Pre-warm',
    co2Saved: '22.6 Tons Saved vs Coal Peaker',
    status: 'Action Required',
    resolved: false,
  },
  {
    id: 'FL-2026-03',
    type: 'curtailment_alert',
    severity: 'medium',
    title: 'High-Turbulence Rotor Cut-Out Threshold',
    timeframe: 'Day 3, 02:00 - 05:00 (3 hrs)',
    excessCapacity: '+24.1 MW',
    rootCause: 'Storm front wind velocity exceeding 22 m/s approaching safety cut-out speed (25 m/s). Rotor stress limit flagged.',
    recommendation: 'Feather Turbine Blades on Array B & Reroute Inflow to Substation Battery Buffer',
    actionType: 'curtail',
    actionButton: 'Schedule Feathering',
    co2Saved: 'Equipment Protection',
    status: 'Scheduled',
    resolved: false,
  }
];
