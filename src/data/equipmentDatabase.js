// Equipment Database & Parameter Mapping (Reflecting Section 3.2 of MegaByte Report)

export const solarPanelsCatalog = [
  {
    id: 'generic-solar',
    brand: 'Generic / Industry Standard Default',
    model: 'Default Poly/Mono Tier-1 Array',
    isDefault: true,
    ratedWattage: 400,
    efficiencyPct: 21.0,
    tempCoefficient: -0.35, // % / °C
    tiltDefault: 25,
    orientationDefault: 'South (180°)',
    bifacial: false,
    degradationPerYear: 0.55,
    description: 'Sensible industry-standard baseline. Used automatically when the operator does not know specific module numbers.'
  },
  {
    id: 'longi-himo6',
    brand: 'LONGi Solar',
    model: 'Hi-MO 6 Explorer (LR5-72HTH-585M)',
    isDefault: false,
    ratedWattage: 585,
    efficiencyPct: 22.8,
    tempCoefficient: -0.29,
    tiltDefault: 28,
    orientationDefault: 'South (180°)',
    bifacial: false,
    degradationPerYear: 0.40,
    description: 'High-efficiency HPBC cell technology optimized for commercial and utility rooftop & ground mount arrays.'
  },
  {
    id: 'firstsolar-series7',
    brand: 'First Solar',
    model: 'Series 7 TR1 (FS-7470)',
    isDefault: false,
    ratedWattage: 540,
    efficiencyPct: 19.7,
    tempCoefficient: -0.32,
    tiltDefault: 30,
    orientationDefault: 'South (180°)',
    bifacial: false,
    degradationPerYear: 0.50,
    description: 'Advanced thin-film CadTel module engineered specifically for high temperature and high humidity utility environments.'
  },
  {
    id: 'canadian-bihiku7',
    brand: 'Canadian Solar',
    model: 'BiHiKu7 (CS7N-665MB-AG)',
    isDefault: false,
    ratedWattage: 665,
    efficiencyPct: 21.4,
    tempCoefficient: -0.34,
    tiltDefault: 26,
    orientationDefault: 'South (180°)',
    bifacial: true,
    bifacialityFactor: 0.70,
    degradationPerYear: 0.45,
    description: 'Dual-glass bifacial TOPCon module capturing rear-side ground albedo irradiance.'
  }
];

export const windTurbinesCatalog = [
  {
    id: 'generic-wind',
    brand: 'Generic / Industry Standard Default',
    model: 'Standard 3.0 MW Class II/III Turbine',
    isDefault: true,
    ratedCapacityMW: 3.0,
    hubHeightM: 100,
    rotorDiameterM: 130,
    cutInSpeedMs: 3.0,
    ratedSpeedMs: 11.5,
    cutOutSpeedMs: 25.0,
    powerCoefficientCp: 0.44,
    description: 'Standard mid-size commercial onshore turbine power curve. Fallback when exact nacelle model is unselected.'
  },
  {
    id: 'vestas-v162',
    brand: 'Vestas',
    model: 'V162-6.2 MW EnVentus',
    isDefault: false,
    ratedCapacityMW: 6.2,
    hubHeightM: 148,
    rotorDiameterM: 162,
    cutInSpeedMs: 3.0,
    ratedSpeedMs: 11.2,
    cutOutSpeedMs: 25.0,
    powerCoefficientCp: 0.49,
    description: 'Next-generation modular powertrain turbine designed for medium to low wind sites with massive swept area.'
  },
  {
    id: 'ge-cypress',
    brand: 'GE Vernova',
    model: 'Cypress 5.5-158',
    isDefault: false,
    ratedCapacityMW: 5.5,
    hubHeightM: 120,
    rotorDiameterM: 158,
    cutInSpeedMs: 3.0,
    ratedSpeedMs: 11.0,
    cutOutSpeedMs: 24.5,
    powerCoefficientCp: 0.48,
    description: 'Two-piece carbon blade architecture for utility-scale high capacity factor operations.'
  },
  {
    id: 'siemens-sg66',
    brand: 'Siemens Gamesa',
    model: 'SG 6.6-170 OptimaFlex',
    isDefault: false,
    ratedCapacityMW: 6.6,
    hubHeightM: 135,
    rotorDiameterM: 170,
    cutInSpeedMs: 2.5,
    ratedSpeedMs: 10.8,
    cutOutSpeedMs: 26.0,
    powerCoefficientCp: 0.495,
    description: 'Ultra-low LCoE onshore flagship with class-leading aerodynamics and low cut-in threshold.'
  }
];
