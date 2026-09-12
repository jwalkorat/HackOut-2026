import React, { useState, useEffect } from 'react';
import { GitBranch, RefreshCw, Activity, ShieldCheck, CheckCircle2, ArrowRight, Play, Server, AlertTriangle, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MLOpsPipeline() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState('Pipeline idle in continuous telemetry ingestion mode.');

  const stages = [
    {
      id: 1,
      title: '1. Ingestion & Drift Monitor',
      tech: 'FastAPI + SCADA Stream',
      description: 'Continuous telemetry ingestion; monitors forecast error (MAPE) against ground-truth power meters.',
      status: 'Nominal (MAPE 3.8%)',
    },
    {
      id: 2,
      title: '2. Retraining Trigger',
      tech: 'Scheduled + Drift Triggered',
      description: 'Airflow DAG fires weekly or whenever forecast drift exceeds 8.0% MAPE or new equipment is added.',
      status: 'Standby / Armed',
    },
    {
      id: 3,
      title: '3. Model Retraining',
      tech: 'Python (LSTM & XGBoost)',
      description: 'Trains multi-horizon time series on sliding window of recent telemetry and historical weather patterns.',
      status: 'Cached v2.4.1',
    },
    {
      id: 4,
      title: '4. MLflow Validation',
      tech: 'MLflow Model Registry',
      description: 'Candidate model is evaluated against a held-out test set; must outperform production baseline.',
      status: 'Gate Passed (R² 0.942)',
    },
    {
      id: 5,
      title: '5. Zero-Downtime Deploy',
      tech: 'Blue/Green Rollback Guard',
      description: 'Automated promotion to live API; immediate rollback if live telemetry deviates from benchmark.',
      status: 'Production Live',
    },
  ];

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);
    setSimulationLog('⚠️ Seasonal atmospheric drift detected: MAPE spiked to 9.2% after unpredicted arctic front.');

    setTimeout(() => {
      setActiveStep(2);
      setSimulationLog('⚡ Triggering automated Airflow Retraining DAG #2026-RETRAIN-882...');
    }, 1500);

    setTimeout(() => {
      setActiveStep(3);
      setSimulationLog('🔄 Training candidate LSTM + XGBoost ensemble on updated 90-day telemetry...');
    }, 3200);

    setTimeout(() => {
      setActiveStep(4);
      setSimulationLog('📊 MLflow Validation: Candidate model achieved 3.2% MAPE on held-out test set (Beats live baseline by 1.8%).');
    }, 4900);

    setTimeout(() => {
      setActiveStep(5);
      setSimulationLog('✓ Automated Blue-Green deployment complete. Model v2.4.2 promoted to Production!');
      setIsSimulating(false);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#38bdf8']
      });
    }, 6600);
  };

  return (
    <section id="mlops" className="relative py-24 bg-dark-950/95 border-t border-slate-900 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Continuous Self-Healing MLOps (Section 3.4)</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Models That Never Go Stale: <br />
            <span className="text-gradient-cyan">Automated Retraining Loop</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            Weather patterns, seasonal sun paths, and turbine component wear cause static models to drift out of accuracy. 
            MegaByte embeds a closed-loop MLOps pipeline that <strong className="text-slate-200">retrains automatically on schedule or error-threshold drift</strong>, 
            validates against a held-out test set in MLflow, and deploys without downtime.
          </p>
        </div>

        {/* Simulation Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isSimulating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Interactive Pipeline Simulator
              </div>
              <div className="text-sm font-mono text-cyan-300 font-semibold mt-0.5">
                {simulationLog}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all ${
              isSimulating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 shadow-glow-cyan hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating Pipeline...' : 'Simulate Model Drift Spike (>8% MAPE)'}</span>
          </button>
        </div>

        {/* 5-Stage Pipeline Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-10">
          {stages.map((stage) => {
            const isCurrent = activeStep === stage.id;
            const isCompleted = activeStep > stage.id || (!isSimulating && activeStep === 0);

            return (
              <div
                key={stage.id}
                className={`p-4 rounded-2xl border transition-all relative ${
                  isCurrent
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-glow-cyan'
                    : isCompleted
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-dark-900/40 border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400">
                    Stage 0{stage.id}
                  </span>
                  {isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : null}
                </div>

                <div className="font-display font-bold text-sm text-white mb-1">
                  {stage.title}
                </div>

                <div className="text-[10px] font-mono text-cyan-300/80 mb-2">
                  {stage.tech}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans mb-3">
                  {stage.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-500">Status: </span>
                  <span className="text-white font-medium">{stage.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MLflow Model Registry Metrics Table */}
        <div className="p-6 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h4 className="font-display font-bold text-base text-white">
                MLflow Model Registry & Version Tracking
              </h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Active Production Artifact: v2.4.2
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80 pb-2">
                  <th className="pb-2.5">Model Version</th>
                  <th className="pb-2.5">Engine Architecture</th>
                  <th className="pb-2.5">Retrain Trigger</th>
                  <th className="pb-2.5">Test Set MAPE</th>
                  <th className="pb-2.5">R² Fit</th>
                  <th className="pb-2.5">Deployment Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="bg-cyan-500/5">
                  <td className="py-2.5 font-bold text-cyan-300">v2.4.2 (Latest)</td>
                  <td className="py-2.5">Hybrid LSTM + XGBoost</td>
                  <td className="py-2.5 text-amber-300">Drift Trigger (&gt;8% MAPE)</td>
                  <td className="py-2.5 text-emerald-400 font-bold">3.18%</td>
                  <td className="py-2.5 text-white">0.962</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live Production
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400">v2.4.1</td>
                  <td className="py-2.5">LSTM Bi-directional</td>
                  <td className="py-2.5">Weekly Scheduled Cadence</td>
                  <td className="py-2.5 text-slate-400">4.12%</td>
                  <td className="py-2.5 text-slate-400">0.938</td>
                  <td className="py-2.5 text-slate-500">Archived Standby</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-400">v2.4.0</td>
                  <td className="py-2.5">XGBoost Regressor</td>
                  <td className="py-2.5">Equipment Spec Table Update</td>
                  <td className="py-2.5 text-slate-400">4.85%</td>
                  <td className="py-2.5 text-slate-400">0.924</td>
                  <td className="py-2.5 text-slate-500">Archived Standby</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
