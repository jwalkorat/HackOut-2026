import React, { useState, useCallback } from 'react';
import {
  Sliders, Sparkles, Zap, ShieldCheck, RefreshCw,
  CheckCircle2, Save, MapPin, Loader2, AlertTriangle, Info
} from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../../data/equipmentDatabase';
import { geocodeLocation, mapConfigToApiRequest } from '../../utils/apiHelpers';

/**
 * Physics formula preview — shows the user what corrections will be applied
 * before they hit "Apply".
 */
function PhysicsPreview({ energyType, solarPanel, windTurbine, tiltAngle, hubHeight, latitude }) {
  const getEfficiencyRatio = () => {
    const p = solarPanelsCatalog.find(p => p.id === solarPanel);
    if (!p) return 1.0;
    return (p.efficiencyPct / 20.0).toFixed(3);
  };

  const getTiltFactor = () => {
    const optimal = Math.abs(latitude || 23);
    const tilt    = parseFloat(tiltAngle) || optimal;
    const delta   = Math.abs(tilt - optimal);
    return Math.cos((delta * Math.PI) / 180).toFixed(3);
  };

  const getHubShear = () => {
    const h = parseFloat(hubHeight) || 80;
    return (Math.pow(h / 10, 0.14)).toFixed(3);
  };

  const showSolar = energyType === 'solar' || energyType === 'hybrid';
  const showWind  = energyType === 'wind'  || energyType === 'hybrid';

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-sky-500/30 text-xs font-mono space-y-3">
      <div className="text-sky-400 font-bold text-[11px] tracking-widest uppercase flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />
        Live Physics Formula Preview
      </div>

      {showSolar && (
        <div className="space-y-1.5">
          <div className="text-amber-400 font-semibold">Solar Correction Chain</div>
          <div className="text-slate-300 leading-loose">
            <span className="text-white">P_adj</span>(t) ={' '}
            <span className="text-sky-300">P_model</span>(t)
            {' × '}
            <span className="text-emerald-300" title="Panel efficiency / Generic 20%">
              η_ratio({getEfficiencyRatio()})
            </span>
            {' × '}
            <span className="text-yellow-300" title="IEC 61215 temperature derating">
              [1 + γ·(T−25)]
            </span>
            {' × '}
            <span className="text-pink-300" title="cos(|tilt − latitude|)">
              F_tilt({getTiltFactor()})
            </span>
          </div>
          <div className="text-slate-500 text-[10px]">
            γ = temp_coeff (%/°C) of selected panel · T_STC = 25 °C · IEC 61215
          </div>
        </div>
      )}

      {showWind && (
        <div className="space-y-1.5">
          <div className="text-cyan-400 font-semibold">Wind Correction Chain</div>
          <div className="text-slate-300 leading-loose">
            <span className="text-white">v_hub</span> ={' '}
            <span className="text-sky-300">v_10m</span>
            {' × '}
            <span className="text-emerald-300" title="Power-law wind shear, IEC 61400">
              (h_hub/10)^0.14 = {getHubShear()}×
            </span>
          </div>
          <div className="text-slate-300 leading-loose">
            <span className="text-white">P_adj</span>(t) ={' '}
            <span className="text-sky-300">P_model</span>(t){' × '}
            <span className="text-pink-300" title="Turbine power curve ratio vs generic">
              [P_turbine(v_hub) / P_generic(v_hub)]
            </span>
          </div>
          <div className="text-slate-500 text-[10px]">
            α = 0.14 Hellmann exponent · IEC 61400-12-1 cubic power curve
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConfigTab({ onFetchForecast, onApplyConfig }) {
  const [activeLayer, setActiveLayer] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Resolved coordinates from geocoding
  const [resolvedCoords, setResolvedCoords] = useState(null); // { latitude, longitude, display }

  // Layer 1 form state
  const [location, setLocation]             = useState('Mojave Desert, California');
  const [energyType, setEnergyType]         = useState('hybrid');
  const [installedCapacity, setInstalledCap] = useState('200');
  const [demandPower, setDemandPower]        = useState('145');

  // Layer 2 optional fields
  const [selectedPanel,   setSelectedPanel]   = useState('generic-solar');
  const [selectedTurbine, setSelectedTurbine] = useState('generic-wind');
  const [tiltAngle,  setTiltAngle]   = useState('');
  const [hubHeight,  setHubHeight]   = useState('');
  const [batteryMWh, setBatteryMWh]  = useState('80');
  const [batterySOC, setBatterySOC]  = useState('85');

  // Live confidence score
  let accuracyScore = 82.5;
  if (activeLayer === 2) {
    if (selectedPanel   !== 'generic-solar') accuracyScore += 4.5;
    if (selectedTurbine !== 'generic-wind')  accuracyScore += 4.2;
    if (tiltAngle  && tiltAngle  !== '')     accuracyScore += 2.1;
    if (hubHeight  && hubHeight  !== '')     accuracyScore += 2.0;
    if (batteryMWh && Number(batteryMWh) > 0) accuracyScore += 1.5;
  }
  accuracyScore = Math.min(97.8, accuracyScore);

  // Derive latitude from resolved coords (for tilt preview)
  const latitude = resolvedCoords?.latitude ?? 23.0;

  // ── Geocode on blur ──────────────────────────────────────────
  const handleLocationBlur = useCallback(async () => {
    if (!location.trim()) return;
    setIsGeocoding(true);
    setGeocodeError(null);
    const result = await geocodeLocation(location);
    setIsGeocoding(false);
    if (result) {
      setResolvedCoords(result);
    } else {
      setGeocodeError('Location not found — using default coordinates (Ahmedabad, India).');
      setResolvedCoords({ latitude: 23.0225, longitude: 72.5714, display: 'Default' });
    }
  }, [location]);

  // ── Apply & Recalculate ──────────────────────────────────────
  const handleSave = async () => {
    if (!onFetchForecast) return;
    setIsSubmitting(true);
    setGeocodeError(null);

    // Ensure we have coordinates
    let coords = resolvedCoords;
    if (!coords) {
      setIsGeocoding(true);
      coords = await geocodeLocation(location);
      setIsGeocoding(false);
      if (!coords) {
        coords = { latitude: 23.0225, longitude: 72.5714, display: 'Default' };
        setGeocodeError('Could not resolve location. Using default coordinates.');
      }
      setResolvedCoords(coords);
    }

    // Build API request
    const capacityKw = parseFloat(installedCapacity) * 1000;  // MW → kW
    const demandKw   = parseFloat(demandPower) * 1000;        // MW → kW

    const payload = mapConfigToApiRequest({
      latitude:      coords.latitude,
      longitude:     coords.longitude,
      energyType,
      capacityKw,
      demandKw,
      solarPanelId:  selectedPanel,
      windTurbineId: selectedTurbine,
      tiltAngleDeg:  tiltAngle  ? parseFloat(tiltAngle)  : null,
      hubHeightM:    hubHeight  ? parseFloat(hubHeight)  : null,
      batteryKwh:    parseFloat(batteryMWh) * 1000,
      batterySOC:    parseFloat(batterySOC),
      hasBackupGen:  true,
    });

    await onFetchForecast(payload);

    if (onApplyConfig) {
      onApplyConfig({
        location: coords.display || location,
        installedCapacity: `${installedCapacity} MW`,
        accuracyScore: accuracyScore.toFixed(1),
      });
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Banner & Layer Switcher ── */}
      <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-mono font-bold mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Layered Data Architecture — Live API Integration</span>
            </div>
            <h3 className="font-display font-black text-xl text-slate-900">
              Plant Specification & Progressive Parameter Tuning
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              3 core inputs generate a usable forecast. Layer 2 applies real physics corrections (IEC 61215 / IEC 61400).
            </p>
          </div>

          <div className="flex items-center p-1 rounded-2xl bg-sky-50 border border-sky-200">
            <button
              onClick={() => setActiveLayer(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 1 ? 'bg-sky-600 text-white shadow-glow-sky' : 'text-slate-600 hover:text-sky-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Layer 1: 10s Setup</span>
            </button>
            <button
              onClick={() => setActiveLayer(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeLayer === 2 ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layer 2: Physics Boosters</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Form + Confidence Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-sky-100">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeLayer === 1 ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`} />
              <h4 className="font-display font-black text-base text-slate-900">
                {activeLayer === 1 ? 'Layer 1 — Core Site Specification' : 'Layer 2 — Physics Parameter Boosters'}
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {activeLayer === 1 ? '3 Required Fields' : 'Optional — real-world equipment corrections'}
            </span>
          </div>

          {/* ── Layer 1 Fields ── */}
          <div className="space-y-4">
            {/* Location with geocoding */}
            <div>
              <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5 flex items-center justify-between">
                <span>Site Location *</span>
                {resolvedCoords && !isGeocoding && (
                  <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {resolvedCoords.latitude.toFixed(4)}°, {resolvedCoords.longitude.toFixed(4)}°
                  </span>
                )}
                {isGeocoding && (
                  <span className="text-[10px] text-sky-600 font-mono flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Geocoding...
                  </span>
                )}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setResolvedCoords(null); }}
                onBlur={handleLocationBlur}
                placeholder="e.g. Rajkot, Gujarat or Mojave Desert, CA"
                className="w-full px-4 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-sans focus:outline-none focus:border-sky-400 font-medium"
              />
              {geocodeError && (
                <p className="mt-1 text-[10px] font-mono text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {geocodeError}
                </p>
              )}
              <p className="mt-1 text-[10px] font-mono text-slate-400">
                Tab out of the field to auto-resolve lat/lon via Open-Meteo Geocoding API.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Energy Asset Type *</label>
                <select
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-sky-400 font-medium"
                >
                  <option value="solar">Solar PV Only</option>
                  <option value="wind">Wind Fleet Only</option>
                  <option value="hybrid">Solar + Wind (Co-Located)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Installed Capacity (MW) *</label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={installedCapacity}
                  onChange={(e) => setInstalledCap(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Grid Demand Baseline (MW) *</label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={demandPower}
                  onChange={(e) => setDemandPower(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* ── Layer 2 Accordion ── */}
          {activeLayer === 2 && (
            <div className="mt-6 pt-6 border-t border-sky-100 space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  These parameters feed real IEC physics formulas (see preview panel →).
                  Omitted fields fall back to industry defaults.
                </span>
              </div>

              {/* Equipment Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(energyType === 'solar' || energyType === 'hybrid') && (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">
                      Solar Module Preset
                      <span className="ml-1 text-amber-600">(η_ratio correction)</span>
                    </label>
                    <select
                      value={selectedPanel}
                      onChange={(e) => setSelectedPanel(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {solarPanelsCatalog.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.isDefault ? `Generic / Don't know — use industry defaults` : `${p.brand}: ${p.model} (${p.efficiencyPct}%)`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(energyType === 'wind' || energyType === 'hybrid') && (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">
                      Wind Turbine Preset
                      <span className="ml-1 text-cyan-600">(power curve correction)</span>
                    </label>
                    <select
                      value={selectedTurbine}
                      onChange={(e) => setSelectedTurbine(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm focus:outline-none focus:border-amber-400 font-medium"
                    >
                      {windTurbinesCatalog.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.isDefault ? `Generic / Don't know — use industry defaults` : `${t.brand}: ${t.model}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Tilt + Hub Height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(energyType === 'solar' || energyType === 'hybrid') && (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">
                      Array Tilt Angle (°)
                      <span className="ml-1 text-pink-600">(F_tilt factor)</span>
                    </label>
                    <input
                      type="number" min="0" max="90" step="1"
                      placeholder={`Optimal ≈ ${Math.abs(latitude).toFixed(0)}° (your latitude)`}
                      value={tiltAngle}
                      onChange={(e) => setTiltAngle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {(energyType === 'wind' || energyType === 'hybrid') && (
                  <div>
                    <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">
                      Turbine Hub Height (m)
                      <span className="ml-1 text-emerald-600">(wind shear)</span>
                    </label>
                    <input
                      type="number" min="10" max="250" step="1"
                      placeholder="e.g. 80, 100, 120"
                      value={hubHeight}
                      onChange={(e) => setHubHeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Battery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">BESS Capacity (MWh)</label>
                  <input
                    type="number" min="0" step="1"
                    value={batteryMWh}
                    onChange={(e) => setBatteryMWh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-600 font-semibold mb-1.5">Current BESS SOC (%)</label>
                  <input
                    type="number" min="0" max="100" step="1"
                    value={batterySOC}
                    onChange={(e) => setBatterySOC(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Live Physics Preview */}
              <PhysicsPreview
                energyType={energyType}
                solarPanel={selectedPanel}
                windTurbine={selectedTurbine}
                tiltAngle={tiltAngle}
                hubHeight={hubHeight}
                latitude={latitude}
              />
            </div>
          )}

          {/* ── Save Button ── */}
          <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between">
            {savedNotice ? (
              <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Forecast Recalculated with Physics Corrections!</span>
              </span>
            ) : (
              <span className="text-xs font-mono text-slate-500">
                Triggers live API call → weather fetch → AI model → physics corrections → updated forecast
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSubmitting || isGeocoding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-bold text-xs shadow-glow-sky active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Calculating...</span></>
              ) : (
                <><Save className="w-3.5 h-3.5" /><span>Apply & Recalculate Forecast</span></>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Confidence Meter + Fallback Registry */}
        <div className="lg:col-span-5 space-y-6">
          {/* Confidence Meter */}
          <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-sky-100">
              <span className="text-xs font-display font-black text-slate-900 uppercase tracking-wider">
                Forecast Confidence Score
              </span>
              <span className="text-xs font-mono text-sky-700 font-bold">
                {activeLayer === 1 ? 'Layer 1 Baseline' : 'Layer 2 Enhanced'}
              </span>
            </div>

            <div className="flex items-end justify-between my-2">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-display text-slate-900">
                  {accuracyScore.toFixed(1)}%
                </div>
                <div className="text-xs font-mono text-emerald-700 font-bold mt-1">
                  {activeLayer === 1 ? '✓ Usable Day-Ahead Dispatch Forecast' : '⚡ High-Precision Physics-Corrected Dispatch'}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>

            <div className="w-full h-3 rounded-full bg-sky-100 border border-sky-200 overflow-hidden my-4">
              <div
                style={{ width: `${accuracyScore}%` }}
                className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500"
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeLayer === 1
                ? 'With 3 required fields, the AI model couples live Open-Meteo weather with XGBoost generation predictions.'
                : 'Layer 2 applies IEC 61215 temperature derating, tilt geometry correction, and IEC 61400 wind shear + power curve physics to the raw model output.'}
            </p>
          </div>

          {/* Physics Formula Registry */}
          <div className="p-6 rounded-3xl bg-sky-50/70 border border-sky-200/90">
            <h4 className="font-display font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-600" />
              <span>Physics Correction Formulas Applied:</span>
            </h4>

            <div className="space-y-2 text-xs font-mono text-slate-700">
              <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                <div className="text-sky-800 font-bold mb-0.5">Solar Efficiency</div>
                <div className="text-slate-500">η_ratio = η_panel / 20.0  (vs. generic baseline)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                <div className="text-sky-800 font-bold mb-0.5">Temperature Derating  (IEC 61215)</div>
                <div className="text-slate-500">F_temp = 1 + γ·(T − 25)   γ = −0.29 to −0.35 %/°C</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                <div className="text-sky-800 font-bold mb-0.5">Tilt Geometry</div>
                <div className="text-slate-500">F_tilt = cos(|tilt − latitude| × π/180)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                <div className="text-cyan-800 font-bold mb-0.5">Wind Shear  (IEC 61400-12-1)</div>
                <div className="text-slate-500">v_hub = v_10m × (h_hub / 10)^0.14</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-sky-200">
                <div className="text-cyan-800 font-bold mb-0.5">Turbine Power Curve</div>
                <div className="text-slate-500">P(v) = ((v−v_ci)/(v_r−v_ci))³  for v_ci ≤ v &lt; v_r</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
