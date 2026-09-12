import React, { useState } from 'react';
import { TrendingUp, Sun, Wind, Zap, Search, Filter, Download, Calendar, Layers, ShieldCheck } from 'lucide-react';
import GenerationChart from './GenerationChart';

export default function ForecastTab({ forecastData = [], currentSite }) {
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | surplus | shortfall | balanced

  const filteredData = forecastData.filter((item) => {
    const matchesSearch =
      item.timeLabel.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.dayLabel.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.flagStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics across 72 hours
  const totalSolarMWh = forecastData.reduce((acc, curr) => acc + curr.solarGen, 0);
  const totalWindMWh = forecastData.reduce((acc, curr) => acc + curr.windGen, 0);
  const totalGenMWh = forecastData.reduce((acc, curr) => acc + curr.totalGen, 0);
  const totalDemandMWh = forecastData.reduce((acc, curr) => acc + curr.demand, 0);
  const netSurplusCount = forecastData.filter((d) => d.flagStatus === 'surplus').length;
  const netShortfallCount = forecastData.filter((d) => d.flagStatus === 'shortfall').length;

  const solarPct = totalGenMWh > 0 ? Math.round((totalSolarMWh / totalGenMWh) * 100) : 0;
  const windPct = totalGenMWh > 0 ? Math.round((totalWindMWh / totalGenMWh) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Main Continuous Forecast Chart */}
      <GenerationChart forecastData={forecastData} />

      {/* 2. 72-Hour Energy Balance & Mix Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl surface-card">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>72h Projected Generation</span>
            <Zap className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            {Math.round(totalGenMWh).toLocaleString()} MWh
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-mono">
            <span className="text-amber-600 font-semibold">{solarPct}% Solar</span>
            <span className="text-slate-300">•</span>
            <span className="text-sky-600 font-semibold">{windPct}% Wind</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl surface-card">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>72h Scheduled Demand</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-indigo-900 mt-2">
            {Math.round(totalDemandMWh).toLocaleString()} MWh
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500">
            CAISO Balancing Authority Node
          </div>
        </div>

        <div className="p-5 rounded-3xl surface-card">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Surplus Absorption Windows</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-emerald-700 mt-2">
            {netSurplusCount} Hours
          </div>
          <div className="mt-2 text-xs font-mono text-emerald-700 font-medium">
            Battery charge & export candidates
          </div>
        </div>

        <div className="p-5 rounded-3xl surface-card">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Shortfall Deficit Windows</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-amber-700 mt-2">
            {netShortfallCount} Hours
          </div>
          <div className="mt-2 text-xs font-mono text-amber-700 font-medium">
            Pre-warm peaker / BESS discharge
          </div>
        </div>
      </div>

      {/* 3. Hourly Forecast Data Table & Inspector */}
      <div className="p-6 rounded-3xl surface-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-sky-100">
          <div>
            <h4 className="font-display font-black text-base text-slate-900">
              72-Hour Continuous Telemetry Inspector Table
            </h4>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Hour-by-hour time series data: Solar DNI, Wind m/s, Generation MW, and Net Delta
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by day or time..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-800 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="flex items-center p-1 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono">
              {['all', 'surplus', 'shortfall'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-sky-50 text-slate-600 z-10 border-b border-sky-200">
              <tr>
                <th className="py-2.5 px-3">Time Window</th>
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Solar MW</th>
                <th className="py-2.5 px-3">Wind MW</th>
                <th className="py-2.5 px-3">Total Gen MW</th>
                <th className="py-2.5 px-3">Demand MW</th>
                <th className="py-2.5 px-3">Net Delta</th>
                <th className="py-2.5 px-3">Wind m/s</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-slate-700">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-sky-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{row.timeLabel}</td>
                  <td className="py-2.5 px-3 text-slate-500">{row.dayLabel}</td>
                  <td className="py-2.5 px-3 text-amber-600 font-medium">{row.solarGen}</td>
                  <td className="py-2.5 px-3 text-sky-600 font-medium">{row.windGen}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{row.totalGen}</td>
                  <td className="py-2.5 px-3 text-indigo-600">{row.demand}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-bold ${
                        row.netBalance >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {row.netBalance > 0 ? `+${row.netBalance}` : row.netBalance} MW
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{row.windSpeed}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        row.flagStatus === 'surplus'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.flagStatus === 'shortfall'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-sky-50 text-sky-800 border-sky-200'
                      }`}
                    >
                      {row.flagStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
