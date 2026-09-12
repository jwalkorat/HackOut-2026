import React, { useState, useCallback, useMemo } from 'react';
import {
  Zap, Sun, Wind, MapPin, Loader2, AlertTriangle, CheckCircle2,
  Sparkles, Battery, Settings2, Info, ChevronDown, ChevronUp, Gauge, Thermometer
} from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../../data/equipmentDatabase';
import { geocodeLocation, mapConfigToApiRequest } from '../../utils/apiHelpers';

/* ─────────────────────────────────────────────────────────
   Shared style constants
───────────────────────────────────────────────────────── */
const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-sans placeholder:text-slate-500 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all';

const selectCls =
  'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all appearance-none cursor-pointer';

const autofillCls =
  'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-mono focus:outline-none focus:border-amber-400/60 focus:bg-white/8 transition-all';

/* ─────────────────────────────────────────────────────────
   Small reusable components
───────────────────────────────────────────────────────── */
const Label = ({ children, hint, tag }) => (
  <label className="block text-xs font-mono text-slate-300 font-semibold mb-1.5">
    {children}
    {hint && <span className="ml-2 text-slate-500 font-normal">{hint}</span>}
    {tag  && <span className="ml-2 text-amber-400 font-mono text-[10px]">{tag}</span>}
  </label>
);

/** Shows a value auto-filled from a preset — user can override */
const AutofillBadge = () => (
  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5 ml-1">
    auto-filled
  </span>
);

function EnergyCard({ id, label, sub, icon: Icon, colorClass, borderClass, bgClass, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-display font-bold text-xs ${
        selected ? `${borderClass} ${bgClass} ${colorClass}` : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
      }`}
    >
      <Icon className={`w-6 h-6 ${selected ? colorClass : 'text-slate-500'}`} />
      <span>{label}</span>
      <span className="text-[10px] font-mono font-normal opacity-70">{sub}</span>
    </button>
  );
}

function StepDot({ step, current, label }) {
  const done   = step < current;
  const active = step === current;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
        done    ? 'bg-emerald-500 border-emerald-500 text-white'
        : active ? 'bg-sky-500 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                 : 'bg-white/5 border-white/20 text-slate-500'
      }`}>
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <span className={`text-xs font-mono hidden sm:block ${active ? 'text-white font-bold' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}

/** A row showing an auto-filled spec value with optional override input */
function SpecRow({ label, defaultVal, unit, value, onChange, min, max, step = 'any' }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs font-mono text-slate-400">{label}</span>
        <AutofillBadge />
      </div>
      <div className="relative">
        <input
          type="number"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={autofillCls}
          placeholder={`${defaultVal} ${unit}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Wizard Component
───────────────────────────────────────────────────────── */
export default function InputWizard({ onSubmit }) {
  const [step, setStep]                   = useState(1);
  const [isGeocoding, setIsGeocoding]     = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [geocodeError, setGeocodeError]   = useState(null);
  const [layer2Open, setLayer2Open]       = useState(false); // collapsible in step 2

  /* ── Layer 1: Required ─── */
  const [location, setLocation]           = useState('');
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [energyType, setEnergyType]       = useState('');
  const [capacityMW, setCapacityMW]       = useState('');
  const [demandMW, setDemandMW]           = useState('');

  /* ── Layer 2: Equipment presets ─── */
  const [solarPanelId,   setSolarPanelId]   = useState('generic-solar');
  const [windTurbineId,  setWindTurbineId]  = useState('generic-wind');

  /* ── Layer 2: Optional overrides (auto-filled from preset) ─── */
  const [tiltAngle,  setTiltAngle]   = useState('');
  const [hubHeight,  setHubHeight]   = useState('');
  const [cutInSpeed, setCutInSpeed]  = useState('');
  const [cutOutSpeed,setCutOutSpeed] = useState('');

  /* ── Layer 2: Storage & backup ─── */
  const [batteryMWh,   setBatteryMWh]   = useState('');
  const [batterySOC,   setBatterySOC]   = useState('');
  const [hasBackupGen, setHasBackupGen] = useState(false);
  const [backupCapMW,  setBackupCapMW]  = useState('');

  /* ── Derived preset specs for display ─── */
  const selectedPanel   = useMemo(() => solarPanelsCatalog.find(p => p.id === solarPanelId),   [solarPanelId]);
  const selectedTurbine = useMemo(() => windTurbinesCatalog.find(t => t.id === windTurbineId), [windTurbineId]);

  const showSolar = energyType === 'solar'  || energyType === 'hybrid';
  const showWind  = energyType === 'wind'   || energyType === 'hybrid';

  /* ── Auto-fill overrides when preset changes ─── */
  const handlePanelChange = (id) => {
    setSolarPanelId(id);
    const p = solarPanelsCatalog.find(x => x.id === id);
    if (p) setTiltAngle(String(p.tiltDefault ?? ''));
  };

  const handleTurbineChange = (id) => {
    setWindTurbineId(id);
    const t = windTurbinesCatalog.find(x => x.id === id);
    if (t) {
      setHubHeight(String(t.hubHeightM ?? ''));
      setCutInSpeed(String(t.cutInSpeedMs ?? ''));
      setCutOutSpeed(String(t.cutOutSpeedMs ?? ''));
    }
  };

  /* ── Geocoding ─── */
  const handleLocationBlur = useCallback(async () => {
    if (!location.trim() || location.trim().length < 3) return;
    setIsGeocoding(true);
    setGeocodeError(null);
    const result = await geocodeLocation(location);
    setIsGeocoding(false);
    if (result) {
      setResolvedCoords(result);
    } else {
      setGeocodeError('Location not found — check spelling or try a nearby city name.');
      setResolvedCoords(null);
    }
  }, [location]);

  const step1Valid = resolvedCoords && energyType && capacityMW && demandMW;

  /* ── Submit ─── */
  const handleFinish = async () => {
    if (!step1Valid) return;
    setIsSubmitting(true);

    const capacityKw = parseFloat(capacityMW) * 1000;
    const demandKw   = parseFloat(demandMW)   * 1000;
    const batKwh     = batteryMWh ? parseFloat(batteryMWh) * 1000 : 0;
    const soc        = batterySOC ? parseFloat(batterySOC) : 50;

    const payload = mapConfigToApiRequest({
      latitude:      resolvedCoords.latitude,
      longitude:     resolvedCoords.longitude,
      energyType,
      capacityKw,
      demandKw,
      solarPanelId,
      windTurbineId,
      tiltAngleDeg:  tiltAngle   ? parseFloat(tiltAngle)   : null,
      hubHeightM:    hubHeight   ? parseFloat(hubHeight)   : null,
      batteryKwh:    batKwh,
      batterySOC:    soc,
      hasBackupGen,
    });

    await onSubmit(payload, {
      location:    resolvedCoords.display || location,
      energyType,
      capacityMW:  parseFloat(capacityMW),
      demandMW:    parseFloat(demandMW),
      coords:      resolvedCoords,
      batteryMWh:  parseFloat(batteryMWh) || 0,
      batterySOC:  soc,
    });

    setIsSubmitting(false);
  };

  /* ──────────────────────────────────────────────────────
     Render
  ────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#050d1a] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-[-15%] left-[-5%] w-[55vw] h-[55vw] rounded-full bg-sky-600/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-600/8 blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-2xl">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_22px_rgba(56,189,248,0.45)]">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="font-display font-black text-xl text-white tracking-tight">
              MegaByte<span className="text-sky-400">.AI</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              AI-Powered Renewable Generation Forecasting Engine
            </div>
          </div>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-3 mb-8">
          <StepDot step={1} current={step} label="Layer 1 — Required" />
          <div className="flex-1 h-px bg-white/10" />
          <StepDot step={2} current={step} label="Layer 2 — Accuracy Boosters" />
        </div>

        {/* ════════════════════════════════════
            STEP 1 — Layer 1 (Required, ~10s)
        ════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-7 animate-fade-in">

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-mono font-bold mb-3">
                <Zap className="w-3 h-3" /> Layer 1 — Required (~10 seconds)
              </div>
              <h1 className="font-display font-black text-2xl text-white mb-1">Configure Your Plant</h1>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                These 4 fields are enough to generate a usable 72-hour forecast using sensible industry-standard defaults.
              </p>
            </div>

            {/* ① Location */}
            <div>
              <Label hint="city, region, or landmark">Site Location *</Label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setResolvedCoords(null); }}
                  onBlur={handleLocationBlur}
                  placeholder="e.g. Rajkot, Gujarat   or   Mojave Desert, CA"
                  className={inputCls}
                />
                {isGeocoding && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-sky-400" />}
              </div>
              {resolvedCoords && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <MapPin className="w-3 h-3" />
                  {resolvedCoords.display} — {resolvedCoords.latitude.toFixed(4)}°, {resolvedCoords.longitude.toFixed(4)}°
                </p>
              )}
              {geocodeError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
                  <AlertTriangle className="w-3 h-3" /> {geocodeError}
                </p>
              )}
              {!resolvedCoords && !isGeocoding && !geocodeError && location.length > 2 && (
                <p className="mt-1 text-[10px] font-mono text-slate-500">Press Tab to auto-resolve coordinates →</p>
              )}
            </div>

            {/* ② Energy Asset Type */}
            <div>
              <Label>Energy Asset Type *</Label>
              <div className="grid grid-cols-3 gap-3">
                <EnergyCard
                  id="solar" label="Solar PV" sub="Photovoltaic" icon={Sun}
                  colorClass="text-amber-300" borderClass="border-amber-400" bgClass="bg-amber-400/8"
                  selected={energyType === 'solar'} onClick={setEnergyType}
                />
                <EnergyCard
                  id="wind" label="Wind Fleet" sub="Turbines" icon={Wind}
                  colorClass="text-sky-300" borderClass="border-sky-400" bgClass="bg-sky-400/8"
                  selected={energyType === 'wind'} onClick={setEnergyType}
                />
                <EnergyCard
                  id="hybrid" label="Solar + Wind" sub="Co-Located Hybrid" icon={Zap}
                  colorClass="text-emerald-300" borderClass="border-emerald-400" bgClass="bg-emerald-400/8"
                  selected={energyType === 'hybrid'} onClick={setEnergyType}
                />
              </div>
            </div>

            {/* ③ Demand Power & ④ Installed Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label hint="average grid draw">Demand Power (MW) *</Label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={demandMW}
                  onChange={(e) => setDemandMW(e.target.value)}
                  placeholder="e.g. 75"
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] font-mono text-slate-500">Average load your grid draws from this plant</p>
              </div>
              <div>
                <Label hint="nameplate rating">Installed Capacity (MW) *</Label>
                <input
                  type="number" min="0.1" step="0.1"
                  value={capacityMW}
                  onChange={(e) => setCapacityMW(e.target.value)}
                  placeholder="e.g. 100"
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] font-mono text-slate-500">Total nameplate capacity of the generation asset</p>
              </div>
            </div>

            {/* Validation hint */}
            {!step1Valid && (location || energyType || capacityMW || demandMW) && (
              <div className="flex items-start gap-2 text-[11px] font-mono text-slate-500 bg-white/3 rounded-xl px-3 py-2.5 border border-white/8">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>All 4 fields required. Tab out of the Location field to resolve coordinates.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-mono text-slate-500">Live API forecast — no mock data</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!step1Valid}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-slate-300 text-xs font-mono hover:border-white/25 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Improve Accuracy (Optional)
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!step1Valid || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-35 disabled:cursor-not-allowed text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95 transition-all"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></>
                    : <><Zap className="w-4 h-4 fill-current" /><span>Generate Forecast</span></>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            STEP 2 — Layer 2 (Optional accuracy boosters)
        ════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-6 animate-fade-in">

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono font-bold mb-3">
                <Sparkles className="w-3 h-3" /> Layer 2 — Optional Accuracy Boosters
              </div>
              <h2 className="font-display font-black text-xl text-white mb-1">Equipment & Technical Parameters</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pick your panel or turbine from the preset list. Technical values auto-fill from the lookup table —
                advanced users can override any field. Skip entirely to use industry defaults.
              </p>
            </div>

            {/* ── Solar Panel Section ── */}
            {showSolar && (
              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-500/10">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300">Solar Panel Settings</span>
                </div>
                <div className="p-4 space-y-4">
                  {/* Model picker */}
                  <div>
                    <Label>Panel Model / Brand</Label>
                    <select value={solarPanelId} onChange={(e) => handlePanelChange(e.target.value)} className={selectCls}>
                      {solarPanelsCatalog.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900">
                          {p.isDefault ? `Generic / Don't know — use industry defaults` : `${p.brand}: ${p.model} (${p.efficiencyPct}%)`}
                        </option>
                      ))}
                    </select>
                    {selectedPanel && !selectedPanel.isDefault && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { label: 'Efficiency', val: `${selectedPanel.efficiencyPct}%` },
                          { label: 'Temp Coeff', val: `${selectedPanel.tempCoefficient}%/°C` },
                          { label: 'Rated Power', val: `${selectedPanel.ratedWattage} W` },
                        ].map(({ label, val }) => (
                          <div key={label} className="px-3 py-2 rounded-xl bg-amber-400/8 border border-amber-400/15 text-center">
                            <div className="text-[10px] font-mono text-slate-500">{label}</div>
                            <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">{val}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tilt override */}
                  <SpecRow
                    label="Array Tilt Angle"
                    defaultVal={selectedPanel?.tiltDefault ?? 25}
                    unit="°"
                    value={tiltAngle}
                    onChange={setTiltAngle}
                    min={0} max={90}
                  />
                  {resolvedCoords && (
                    <p className="text-[10px] font-mono text-slate-500 -mt-2">
                      Optimal tilt for {resolvedCoords.display?.split(',')[0]} ≈ {Math.abs(resolvedCoords.latitude).toFixed(0)}° (latitude rule of thumb)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Wind Turbine Section ── */}
            {showWind && (
              <div className="rounded-2xl border border-sky-500/15 bg-sky-500/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-sky-500/10">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono font-bold text-sky-300">Wind Turbine Settings</span>
                </div>
                <div className="p-4 space-y-4">
                  {/* Turbine model picker */}
                  <div>
                    <Label>Turbine Model / Brand</Label>
                    <select value={windTurbineId} onChange={(e) => handleTurbineChange(e.target.value)} className={selectCls}>
                      {windTurbinesCatalog.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900">
                          {t.isDefault ? `Generic / Don't know — use industry defaults` : `${t.brand}: ${t.model} (${t.ratedCapacityMW} MW)`}
                        </option>
                      ))}
                    </select>
                    {selectedTurbine && !selectedTurbine.isDefault && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[
                          { label: 'Rated Power', val: `${selectedTurbine.ratedCapacityMW} MW` },
                          { label: 'Rotor ⌀', val: `${selectedTurbine.rotorDiameterM} m` },
                          { label: 'Default Hub', val: `${selectedTurbine.hubHeightM} m` },
                        ].map(({ label, val }) => (
                          <div key={label} className="px-3 py-2 rounded-xl bg-sky-400/8 border border-sky-400/15 text-center">
                            <div className="text-[10px] font-mono text-slate-500">{label}</div>
                            <div className="text-xs font-mono font-bold text-sky-300 mt-0.5">{val}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Hub height + cut-in/cut-out overrides */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SpecRow
                      label="Hub Height"
                      defaultVal={selectedTurbine?.hubHeightM ?? 100}
                      unit="m"
                      value={hubHeight}
                      onChange={setHubHeight}
                      min={10} max={250}
                    />
                    <SpecRow
                      label="Cut-in Speed"
                      defaultVal={selectedTurbine?.cutInSpeedMs ?? 3.0}
                      unit="m/s"
                      value={cutInSpeed}
                      onChange={setCutInSpeed}
                      min={0} max={10} step={0.1}
                    />
                    <SpecRow
                      label="Cut-out Speed"
                      defaultVal={selectedTurbine?.cutOutSpeedMs ?? 25.0}
                      unit="m/s"
                      value={cutOutSpeed}
                      onChange={setCutOutSpeed}
                      min={10} max={40} step={0.5}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    Values auto-filled from the selected turbine's lookup table. Edit if your site differs from the standard spec.
                  </p>
                </div>
              </div>
            )}

            {/* ── Battery Storage & Backup ── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
                <Battery className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-bold text-slate-300">Storage & Grid Backup</span>
                <span className="ml-auto text-[10px] font-mono text-slate-500">used for grid-action recommendations only</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label hint="leave blank if none">Battery Storage Capacity (MWh)</Label>
                    <input
                      type="number" min="0" step="0.5"
                      value={batteryMWh}
                      onChange={(e) => setBatteryMWh(e.target.value)}
                      placeholder="0 = no BESS"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label hint="0 – 100%">Current Charge Level (SOC %)</Label>
                    <input
                      type="number" min="0" max="100" step="1"
                      value={batterySOC}
                      onChange={(e) => setBatterySOC(e.target.value)}
                      placeholder="e.g. 50"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Backup generator */}
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasBackupGen(!hasBackupGen)}
                      className={`w-10 h-5 rounded-full border-2 transition-all relative ${
                        hasBackupGen ? 'bg-emerald-500 border-emerald-400' : 'bg-white/10 border-white/20'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${
                        hasBackupGen ? 'left-4' : 'left-0.5'
                      }`} />
                    </button>
                    <span className="text-xs font-mono text-slate-300">Has backup / peaker generator</span>
                  </div>
                  {hasBackupGen && (
                    <div className="mt-3">
                      <Label hint="optional">Backup Generator Capacity (MW)</Label>
                      <input
                        type="number" min="0" step="0.5"
                        value={backupCapMW}
                        onChange={(e) => setBackupCapMW(e.target.value)}
                        placeholder="e.g. 25"
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                ← Back to Required Fields
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 disabled:opacity-40 text-white font-display font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95 transition-all"
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating Forecast...</span></>
                  : <><Zap className="w-4 h-4 fill-current" /><span>Generate Forecast</span></>
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
