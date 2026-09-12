import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

export default function ForecastView({ forecastData = [], userConfig, forecastMeta }) {
  const [horizon, setHorizon] = useState(24);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hovered, setHovered] = useState(null);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!forecastData.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <Glass className="p-10 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4">
            <OrbCanvas kind="core" accent={0x0284c7} />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mb-2">No Forecast Data</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Run a forecast from the <strong>Setup</strong> tab to see 72-hour generation vs demand curves here.
          </p>
        </Glass>
      </div>
    );
  }

  // ── Computed aggregates ─────────────────────────────────────────────────────
  const displayed = forecastData.slice(0, horizon);
  const filtered = forecastData.filter((item) => {
    const matchesSearch =
      item.timeLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.dayLabel.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.flagStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSolar  = forecastData.reduce((a, c) => a + c.solarGen, 0);
  const totalWind   = forecastData.reduce((a, c) => a + c.windGen, 0);
  const totalGen    = forecastData.reduce((a, c) => a + c.totalGen, 0);
  const totalDemand = forecastData.reduce((a, c) => a + c.demand, 0);
  const surplusN    = forecastData.filter((d) => d.flagStatus === 'surplus').length;
  const shortN      = forecastData.filter((d) => d.flagStatus === 'shortfall').length;
  const solarPct    = totalGen > 0 ? Math.round((totalSolar / totalGen) * 100) : 0;
  const windPct     = totalGen > 0 ? Math.round((totalWind  / totalGen) * 100) : 0;

  const maxVal = Math.max(...forecastData.map((d) => Math.max(d.totalGen, d.demand)), 1);
  const yOf = (v) => 190 - (v / maxVal) * 150;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['72h Generation', `${Math.round(totalGen).toLocaleString()} MWh`, `${solarPct}% solar • ${windPct}% wind`, 'core', 0x22d3ee],
          ['Scheduled Demand', `${Math.round(totalDemand).toLocaleString()} MWh`, totalDemand > 0 ? 'From user baseline' : 'No demand set', 'battery', 0x818cf8],
          ['Surplus Hours', `${surplusN} hrs`, 'BESS charge candidates', 'sun', 0x34d399],
          ['Shortfall Hours', `${shortN} hrs`, 'Peaker / discharge windows', 'turbine', 0xf59e0b],
        ].map(([l, v, h, k, a]) => (
          <Glass key={l} className="p-4 flex gap-3 items-center">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sky-950/10 shrink-0"><OrbCanvas kind={k} accent={a} /></div>
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">{l}</div>
              <div className="text-2xl font-extrabold tabular text-slate-900">{v}</div>
              <div className="text-[11px] text-sky-700 font-bold">{h}</div>
            </div>
          </Glass>
        ))}
      </div>

      {/* Chart */}
      <Glass className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900">Generation vs demand ribbon</h3>
            <p className="text-xs font-mono text-slate-500">
              AI ensemble (cyan) against {totalDemand > 0 ? 'user demand baseline' : 'no demand set'} (violet)
              {forecastMeta?.weatherSource ? ` • ${forecastMeta.weatherSource}` : ''}
            </p>
          </div>
          <div className="flex p-1 rounded-2xl bg-white/60 border border-sky-200/80">
            {[24, 48, 72].map((h) => (
              <button key={h} type="button" onClick={() => setHorizon(h)} className={`min-h-10 px-3 rounded-xl text-xs font-bold transition-colors ${horizon === h ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{h}h</button>
            ))}
          </div>
        </div>
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox={`0 0 ${displayed.length * 36 + 60} 220`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="genFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[40, 90, 140, 190].map((y) => (
              <line key={y} x1="30" y1={y} x2={displayed.length * 36 + 40} y2={y} stroke="#bae6fd" strokeDasharray="3 4" strokeWidth="1" />
            ))}
            <polygon
              fill="url(#genFill)"
              points={`40,190 ${displayed.map((d, i) => `${40 + i * 36},${yOf(d.totalGen)}`).join(' ')} ${40 + (displayed.length - 1) * 36},190`}
            />
            <polyline fill="none" stroke="#0284c7" strokeWidth="3" points={displayed.map((d, i) => `${40 + i * 36},${yOf(d.totalGen)}`).join(' ')} />
            {totalDemand > 0 && (
              <polyline fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 5" points={displayed.map((d, i) => `${40 + i * 36},${yOf(d.demand)}`).join(' ')} />
            )}
            {displayed.map((d, i) => (
              <circle
                key={i}
                cx={40 + i * 36}
                cy={yOf(d.totalGen)}
                r={hovered === i ? 6 : 3.2}
                fill={d.flagStatus === 'surplus' ? '#10b981' : d.flagStatus === 'shortfall' ? '#f59e0b' : '#0284c7'}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          {hovered != null && displayed[hovered] && (
            <div className="absolute top-2 right-2 glass-chip rounded-xl p-3 text-xs font-mono border border-sky-200 shadow-md">
              <div className="text-sky-950 font-bold">{displayed[hovered].timeLabel}</div>
              <div className="text-slate-700">Gen {displayed[hovered].totalGen} MW</div>
              {totalDemand > 0 && <div className="text-slate-700">Demand {displayed[hovered].demand} MW</div>}
              <div className={displayed[hovered].netBalance >= 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {displayed[hovered].netBalance >= 0 ? '+' : ''}{displayed[hovered].netBalance} MW
              </div>
              {displayed[hovered].recommendation && (
                <div className="text-sky-700 mt-1 text-[10px]">{displayed[hovered].recommendation}</div>
              )}
            </div>
          )}
        </div>
      </Glass>

      {/* Table inspector */}
      <Glass className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-display font-extrabold text-slate-900">72-hour inspector</h3>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} placeholder="Filter day or time" className="pl-8 pr-3 py-2 rounded-xl bg-white/80 border border-sky-200/80 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white transition-colors" />
            </div>
            {['all', 'surplus', 'shortfall'].map((st) => (
              <button key={st} type="button" onClick={() => setStatusFilter(st)} className={`px-3 min-h-10 rounded-xl text-xs capitalize transition-colors ${statusFilter === st ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-white/60 border border-sky-200/60 text-slate-600 hover:bg-white/90'}`}>{st}</button>
            ))}
          </div>
        </div>
        <div className="overflow-auto max-h-[380px]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-sky-100/90 text-slate-700 backdrop-blur-md border-b border-sky-200/80 z-10">
              <tr>{['Time', 'Day', 'Solar MW', 'Wind MW', 'Gen MW', 'Demand MW', 'Delta MW', 'Wind m/s', 'Flag', 'Action'].map((h) => <th key={h} className="py-2 px-2 font-bold text-slate-800">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {filtered.map((row) => (
                <tr key={row.hourOffset} className="hover:bg-sky-50/70 transition-colors">
                  <td className="py-2 px-2 font-bold text-slate-900">{row.timeLabel}</td>
                  <td className="py-2 px-2 text-slate-500">{row.dayLabel}</td>
                  <td className="py-2 px-2 text-amber-700 font-semibold">{row.solarGen}</td>
                  <td className="py-2 px-2 text-sky-700 font-semibold">{row.windGen}</td>
                  <td className="py-2 px-2 font-bold text-slate-900">{row.totalGen}</td>
                  <td className="py-2 px-2 text-violet-700 font-medium">{row.demand > 0 ? row.demand : '—'}</td>
                  <td className={`py-2 px-2 font-bold ${row.netBalance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{row.netBalance > 0 ? '+' : ''}{row.netBalance}</td>
                  <td className="py-2 px-2 text-slate-700">{row.windSpeed}</td>
                  <td className={`py-2 px-2 uppercase text-[10px] font-bold ${row.flagStatus === 'surplus' ? 'text-emerald-700' : row.flagStatus === 'shortfall' ? 'text-amber-700' : 'text-slate-500'}`}>{row.flagStatus}</td>
                  <td className="py-2 px-2 text-[10px] text-sky-700 max-w-[160px] truncate">{row.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
