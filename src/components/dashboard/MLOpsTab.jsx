import React, { useState } from 'react';
import { GitBranch, RefreshCw, Activity, ShieldCheck, CheckCircle2, ArrowRight, Play, Server, AlertTriangle, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MLOpsTab() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState('Continuous telemetry ingestion: Model v2.4.2 operating at 3.18% test MAPE.');

  const stages = [
    {
      id: 1,
      title: '1. Ingestion & Drift Monitor',
      tech: 'FastAPI + SCADA Stream',
      description: 'Ingests sub-second SCADA power meters; monitors Mean Absolute Percentage Error (MAPE) against ground-truth.',
      status: 'Nominal (MAPE 3.18%)',
    },
    {
      id: 2,
      title: '2. Retraining Trigger',
      tech: 'Scheduled + Drift Triggered',
      description: 'Airflow DAG fires automatically if forecast drift exceeds 8.0% MAPE or when new equipment models are registered.',
      status: 'Standby / Armed',
    },
    {
      id: 3,
      title: '3. Model Retraining',
      tech: 'Python (LSTM & XGBoost)',
      description: 'Trains multi-horizon time series on sliding 90-day window of ground telemetry and satellite atmospheric data.',
      status: 'Ensemble Active',
    },
    {
      id: 4,
      title: '4. MLflow Validation',
      tech: 'MLflow Model Registry',
      description: 'Candidate model is evaluated against a held-out validation test set; must outperform production baseline.',
      status: 'Gate Passed (R² 0.962)',
    },
    {
      id: 5,
      title: '5. Zero-Downtime Deploy',
      tech: 'Blue/Green Rollback Guard',
      description: 'Automated promotion to live balancing API; instant 1-click rollback if live telemetry deviates from benchmark.',
      status: 'Production Live',
    },
  ];

  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);
    setSimulationLog('⚠️ Simulated Drift: Sudden weather anomaly spiked test MAPE to 9.4% (Threshold: 8.0%).');

    setTimeout(() => {
      setActiveStep(2);
      setSimulationLog('⚡ Drift gate tripped. Triggering automated Airflow Retraining DAG #RETRAIN-2026-09...');
    }, 1500);

    setTimeout(() => {
      setActiveStep(3);
      setSimulationLog('🔄 Retraining candidate LSTM + XGBoost ensemble on updated sliding-window telemetry...');
    }, 3200);

    setTimeout(() => {
      setActiveStep(4);
      setSimulationLog('📊 MLflow Validation: Candidate model achieved 3.12% MAPE on held-out test set (Outperformed baseline).');
    }, 4900);

    setTimeout(() => {
      setActiveStep(5);
      setSimulationLog('✓ Automated Blue-Green deployment complete. Model v2.4.3 promoted to live SCADA dispatch!');
      setIsSimulating(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0284c7', '#059669', '#38bdf8']
      });
    }, 6600);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Control Bar */}
      <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isSimulating ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <div>
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Autonomous Retraining & MLOps Control Loop
              </div>
              <div className="text-sm font-mono text-sky-800 font-bold mt-0.5">
                {simulationLog}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all ${
              isSimulating
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-glow-sky active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Retraining Pipeline Running...' : 'Simulate Model Drift Spike (>8% MAPE)'}</span>
          </button>
        </div>
      </div>

      {/* 5-Stage Pipeline Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const isCurrent = activeStep === stage.id;
          const isCompleted = activeStep > stage.id || (!isSimulating && activeStep === 0);

          return (
            <div
              key={stage.id}
              className={`p-4 rounded-2xl border transition-all relative ${
                isCurrent
                  ? 'bg-sky-100 border-sky-400 shadow-md'
                  : isCompleted
                  ? 'bg-white/95 border-sky-200/90'
                  : 'bg-sky-50/40 border-sky-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-sky-700">
                  Stage 0{stage.id}
                </span>
                {isCurrent ? (
                  <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : null}
              </div>

              <div className="font-display font-black text-sm text-slate-900 mb-1">
                {stage.title}
              </div>

              <div className="text-[10px] font-mono text-sky-700 font-semibold mb-2">
                {stage.tech}
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-3">
                {stage.description}
              </p>

              <div className="pt-2 border-t border-sky-100 text-[10px] font-mono text-slate-500">
                <span>Status: </span>
                <span className="text-slate-900 font-bold">{stage.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MLflow Model Registry Metrics Table */}
      <div className="p-6 rounded-3xl bg-white/95 border border-sky-200/90 shadow-[0_4px_25px_-5px_rgba(2,132,199,0.08)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-sky-100">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600" />
            <h4 className="font-display font-black text-base text-slate-900">
              MLflow Model Registry & Held-Out Test Set Validation
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Production Artifact: v2.4.2
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-sky-100 pb-2">
                <th className="pb-2.5">Model Version</th>
                <th className="pb-2.5">Ensemble Architecture</th>
                <th className="pb-2.5">Trigger Condition</th>
                <th className="pb-2.5">Held-out MAPE</th>
                <th className="pb-2.5">R² Fit</th>
                <th className="pb-2.5">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-slate-700">
              <tr className="bg-sky-50/70 font-semibold">
                <td className="py-2.5 text-sky-800 font-bold">v2.4.2 (Production)</td>
                <td className="py-2.5">LSTM + XGBoost Ensemble</td>
                <td className="py-2.5 text-amber-700">Drift Tripped (&gt;8% MAPE)</td>
                <td className="py-2.5 text-emerald-700 font-bold">3.18%</td>
                <td className="py-2.5 text-slate-900">0.962</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    Active Live
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-600">v2.4.1</td>
                <td className="py-2.5">Bi-directional LSTM</td>
                <td className="py-2.5">Weekly Scheduled Retrain</td>
                <td className="py-2.5 text-slate-600">4.12%</td>
                <td className="py-2.5 text-slate-600">0.938</td>
                <td className="py-2.5 text-slate-500">Standby Rollback</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-600">v2.4.0</td>
                <td className="py-2.5">XGBoost Regressor</td>
                <td className="py-2.5">Equipment Spec Table Update</td>
                <td className="py-2.5 text-slate-600">4.85%</td>
                <td className="py-2.5 text-slate-600">0.924</td>
                <td className="py-2.5 text-slate-500">Archived</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
