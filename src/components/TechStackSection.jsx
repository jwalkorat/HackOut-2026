import React from 'react';
import { Cpu, Database, Server, Terminal, Shield, Code, Sparkles, Layers } from 'lucide-react';

export default function TechStackSection() {
  const stackLayers = [
    {
      layer: 'Data Ingestion',
      purpose: 'Weather, satellite irradiance, and historical generation telemetry',
      tech: 'ECMWF & NOAA Weather APIs, Cloud Streaming Pipelines',
      icon: Database,
      badge: 'Real-Time Ingestion',
      color: 'cyan',
    },
    {
      layer: 'Forecasting Engine',
      purpose: '24–72 hour time-series prediction of solar and wind generation',
      tech: 'Python — LSTM & XGBoost Multi-Horizon Ensembles',
      icon: Cpu,
      badge: 'Time-Series ML',
      color: 'emerald',
    },
    {
      layer: 'Decision Logic',
      purpose: 'Converts forecast surpluses/deficits into concrete grid recommendations',
      tech: 'Heuristic & Rule-Based Optimization Engine',
      icon: Shield,
      badge: 'Decision Support',
      color: 'amber',
    },
    {
      layer: 'Equipment Lookup',
      purpose: 'Maps commercial panel/turbine models to technical loss curves',
      tech: 'Curated JSON / SQL Lookup Table with Documented Fallbacks',
      icon: Server,
      badge: 'Parameter DB',
      color: 'cyan',
    },
    {
      layer: 'MLOps Pipeline',
      purpose: 'Automated retraining, validation, versioning, and zero-downtime deploy',
      tech: 'MLflow (Tracking/Versioning) + Airflow Orchestrator',
      icon: Terminal,
      badge: 'Self-Healing',
      color: 'emerald',
    },
    {
      layer: 'Dashboard & Frontend',
      purpose: 'Real-time telemetry and decision console for grid operators and traders',
      tech: 'React 18, Vite, Tailwind CSS, Three.js / WebGL',
      icon: Code,
      badge: 'Interactive UI',
      color: 'cyan',
    },
    {
      layer: 'Backend & Serving API',
      purpose: 'Serving inference tensors, recommendations, and telemetry data',
      tech: 'FastAPI, Supabase PostgreSQL, Redis Cache',
      icon: Server,
      badge: 'High-Throughput',
      color: 'amber',
    },
  ];

  const implementationStages = [
    { num: '01', title: 'Data Pipeline & Equipment DB', desc: 'Satellite & weather ingestion pipelines linked with curated equipment lookup table.' },
    { num: '02', title: 'Core Forecasting Models', desc: 'LSTM and XGBoost regressors trained on historical solar/wind generation sets.' },
    { num: '03', title: 'Operator Dashboard & UI', desc: 'Real-time interactive control room with 24-72h forecast curves and action feeds.' },
    { num: '04', title: 'MLOps Automation Loop', desc: 'Continuous drift detection, MLflow validation, and automated model re-deployment.' },
  ];

  return (
    <section id="tech-stack" className="relative py-24 bg-dark-950 border-t border-slate-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Technology (Section 5)</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Production-Ready Architecture, <br />
            <span className="text-gradient-hybrid">Grounded in HackOut'26 Report</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Every layer of the platform is designed for enterprise utility reliability, modular maintenance, 
            and scalable ingestion without reinventing the grid wheel.
          </p>
        </div>

        {/* Tech Table / Matrix */}
        <div className="p-6 sm:p-8 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stackLayers.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.badge}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-base text-white mb-1">
                      {item.layer}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed font-sans mb-3">
                      {item.purpose}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 font-mono text-xs text-cyan-300 font-semibold">
                    {item.tech}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Stage Implementation Plan (Directly from Report) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {implementationStages.map((st, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-dark-900/60 border border-slate-800/80">
              <span className="text-2xl font-black font-display text-cyan-400/60 block mb-2">
                {st.num}
              </span>
              <h5 className="font-display font-bold text-sm text-white mb-1">
                {st.title}
              </h5>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
