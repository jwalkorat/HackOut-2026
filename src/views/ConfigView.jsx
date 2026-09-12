import React, { useState } from 'react';
import { Save, Sparkles, Zap, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { solarPanelsCatalog, windTurbinesCatalog } from '../data/equipmentDatabase';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function ConfigView({ onApplyConfig }) {
  const [activeLayer, setActiveLayer] = useState(1);
  const [savedNotice, setSavedNotice] = useState(false);
  const [location, setLocation] = useState('Mojave Desert Solar Basin, California');
  const [energyType, setEnergyType] = useState('hybrid');
  const [installedCapacity, setInstalledCapacity] = useState('200');
  const [demandPower, setDemandPower] = useState('145');
  const [selectedPanel, setSelectedPanel] = useState('generic-solar');
  const [selectedTurbine, setSelectedTurbine] = useState('generic-wind');
  const [tiltAngle, setTiltAngle] = useState('26');
  const [hubHeight, setHubHeight] = useState('120');
  const [batteryCapacity, setBatteryCapacity] = useState('80');
  const [batterySOC, setBatterySOC] = useState('85');
  const [backupCapacity, setBackupCapacity] = useState('25');

  let accuracyScore = 82.5;
  if (activeLayer === 2) {
    if (selectedPanel !== 'generic-solar') accuracyScore += 4.5;
    if (selectedTurbine !== 'generic-wind') accuracyScore += 4.2;
    if (tiltAngle && tiltAngle !== '25') accuracyScore += 2.1;
    if (hubHeight && hubHeight !== '100') accuracyScore += 2.0;
    if (batteryCapacity && Number(batteryCapacity) > 0) accuracyScore += 2.0;
  }
  accuracyScore = Math.min(97.8, accuracyScore);
  const field = 'w-full px-3 py-2.5 rounded-xl bg-white/75 border border-sky-200/80 text-sm text-slate-900 focus:bg-white focus:border-sky-400 transition-colors';

  const handleSave = () => {
    setSavedNotice(true);
    onApplyConfig?.({ location, energyType, installedCapacity: `${installedCapacity} MW`, demandPower, accuracyScore: accuracyScore.toFixed(1) });
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="space-y-4">
      <Glass className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-sky-700 font-bold">Layered data architecture</div>
          <h3 className="font-display font-extrabold text-xl text-slate-900">Plant specification</h3>
          <p className="text-xs text-slate-500">3 core inputs generate a usable forecast. Layer 2 lifts accuracy to 97.8%.</p>
        </div>
        <div className="flex p-1 rounded-2xl bg-white/60 border border-sky-200/80">
          <button type="button" onClick={() => setActiveLayer(1)} className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${activeLayer === 1 ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Zap className="w-3.5 h-3.5 inline mr-1" />Layer 1</button>
          <button type="button" onClick={() => setActiveLayer(2)} className={`min-h-11 px-4 rounded-xl text-xs font-bold transition-colors ${activeLayer === 2 ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}><Sparkles className="w-3.5 h-3.5 inline mr-1" />Layer 2</button>
        </div>
      </Glass>

      <div className="grid lg:grid-cols-12 gap-4">
        <Glass className="lg:col-span-7 p-6 space-y-4">
          <label className="block text-xs font-mono text-slate-600 font-semibold">Site location *
            <input className={`${field} mt-1.5`} value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs font-mono text-slate-600 font-semibold">Asset type *
              <select className={`${field} mt-1.5`} value={energyType} onChange={(e) => setEnergyType(e.target.value)}>
                <option value="solar">Solar PV Only</option>
                <option value="wind">Wind Fleet Only</option>
                <option value="hybrid">Co-Located Hybrid</option>
              </select>
            </label>
            <label className="text-xs font-mono text-slate-600 font-semibold">Capacity (MW) *
              <input type="number" className={`${field} mt-1.5 font-mono font-bold`} value={installedCapacity} onChange={(e) => setInstalledCapacity(e.target.value)} />
            </label>
            <label className="text-xs font-mono text-slate-600 font-semibold">Demand (MW) *
              <input type="number" className={`${field} mt-1.5 font-mono font-bold`} value={demandPower} onChange={(e) => setDemandPower(e.target.value)} />
            </label>
          </div>
          {activeLayer === 2 && (
            <div className="pt-4 border-t border-sky-100 space-y-3 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs font-mono text-slate-600 font-semibold">Solar module
                  <select className={`${field} mt-1.5`} value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)}>
                    {solarPanelsCatalog.map((p) => <option key={p.id} value={p.id}>{p.brand}: {p.model}</option>)}
                  </select>
                </label>
                <label className="text-xs font-mono text-slate-600 font-semibold">Wind turbine
                  <select className={`${field} mt-1.5`} value={selectedTurbine} onChange={(e) => setSelectedTurbine(e.target.value)}>
                    {windTurbinesCatalog.map((t) => <option key={t.id} value={t.id}>{t.brand}: {t.model}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs font-mono text-slate-600 font-semibold">Tilt (deg)<input type="number" className={`${field} mt-1.5`} value={tiltAngle} onChange={(e) => setTiltAngle(e.target.value)} /></label>
                <label className="text-xs font-mono text-slate-600 font-semibold">Hub height (m)<input type="number" className={`${field} mt-1.5`} value={hubHeight} onChange={(e) => setHubHeight(e.target.value)} /></label>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="text-xs font-mono text-slate-600 font-semibold">BESS MWh<input type="number" className={`${field} mt-1.5`} value={batteryCapacity} onChange={(e) => setBatteryCapacity(e.target.value)} /></label>
                <label className="text-xs font-mono text-slate-600 font-semibold">SOC %<input type="number" className={`${field} mt-1.5`} value={batterySOC} onChange={(e) => setBatterySOC(e.target.value)} /></label>
                <label className="text-xs font-mono text-slate-600 font-semibold">Peaker MW<input type="number" className={`${field} mt-1.5`} value={backupCapacity} onChange={(e) => setBackupCapacity(e.target.value)} /></label>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-3">
            {savedNotice ? <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved & recalculated</span> : <span className="text-xs text-slate-500 font-medium">Updates live forecast telemetry</span>}
            <button type="button" onClick={handleSave} className="min-h-11 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors"><Save className="w-3.5 h-3.5" /> Apply & recalculate</button>
          </div>
        </Glass>

        <div className="lg:col-span-5 space-y-4">
          <Glass className="p-5">
            <div className="w-[4.5rem] h-[4.5rem] mx-auto mb-2"><OrbCanvas kind="core" accent={0x0284c7} /></div>
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Forecast confidence</div>
            <div className="text-5xl font-extrabold tabular text-slate-900">{accuracyScore.toFixed(1)}%</div>
            <div className="h-2 rounded-full bg-sky-100 mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-emerald-500" style={{ width: `${accuracyScore}%` }} />
            </div>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{activeLayer === 1 ? 'Usable day-ahead dispatch from three required fields.' : 'Precision boosters refine imbalance penalties.'}</p>
          </Glass>
          <Glass className="p-5 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900"><RefreshCw className="w-4 h-4 text-sky-600" /> Fallback defaults</div>
            {[['Cell efficiency', '21.0%'], ['Orientation', 'South 180°'], ['Power curve', 'Class II/III 3.0 MW'], ['Cut-in / out', '3.0 / 25.0 m/s']].map(([k, v]) => (
              <div key={k} className="glass-chip rounded-xl px-3 py-2 flex justify-between"><span className="text-slate-500 font-medium">{k}</span><span className="text-slate-900 font-bold">{v}</span></div>
            ))}
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold pt-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Documented industry defaults</div>
          </Glass>
        </div>
      </div>
    </div>
  );
}
