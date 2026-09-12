import React, { useState } from 'react';
import { Play, RefreshCw, CheckCircle2, Server } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Glass } from '../components/ui/Glass';
import OrbCanvas from '../components/world/OrbCanvas';

const stages = [
  { id: 1, title: 'Ingestion & drift', tech: 'FastAPI + SCADA', description: 'Sub-second meters; MAPE vs ground truth.', status: 'Nominal MAPE 3.18%' },
  { id: 2, title: 'Retrain trigger', tech: 'Airflow DAG', description: 'Fires if drift exceeds 8% MAPE.', status: 'Standby / armed' },
  { id: 3, title: 'Model retrain', tech: 'LSTM + XGBoost', description: '90-day sliding window + satellite weather.', status: 'Ensemble active' },
  { id: 4, title: 'MLflow gate', tech: 'Model registry', description: 'Must beat production on held-out set.', status: 'R² 0.962 passed' },
  { id: 5, title: 'Blue/green ship', tech: 'Rollback guard', description: 'Promote with instant rollback.', status: 'Production live' },
];

export default function MLOpsView() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [log, setLog] = useState('Continuous ingest: Model v2.4.2 at 3.18% MAPE.');

  const run = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);
    setLog('Simulated drift: MAPE spiked to 9.4% (threshold 8.0%).');
    setTimeout(() => { setActiveStep(2); setLog('Drift gate tripped. Airflow DAG RETRAIN-2026-09.'); }, 1500);
    setTimeout(() => { setActiveStep(3); setLog('Retraining LSTM + XGBoost on sliding window.'); }, 3200);
    setTimeout(() => { setActiveStep(4); setLog('MLflow: candidate 3.12% MAPE, beats baseline.'); }, 4900);
    setTimeout(() => {
      setActiveStep(5);
      setLog('Blue-green complete. Model v2.4.3 promoted.');
      setIsSimulating(false);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 }, colors: ['#22d3ee', '#34d399'] });
    }, 6600);
  };

  return (
    <div className="space-y-4">
      <Glass className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sky-950/10 shrink-0"><OrbCanvas kind="core" accent={isSimulating ? 0xf59e0b : 0x0284c7} /></div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Autonomous retrain loop</div>
            <div className="text-sm font-mono text-sky-950 font-bold mt-1">{log}</div>
          </div>
        </div>
        <button type="button" disabled={isSimulating} onClick={run} className={`min-h-11 px-5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${isSimulating ? 'bg-sky-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20'}`}>
          <Play className="w-3.5 h-3.5 fill-current" /> {isSimulating ? 'Pipeline running…' : 'Simulate drift spike'}
        </button>
      </Glass>

      <div className="grid md:grid-cols-5 gap-2">
        {stages.map((s) => {
          const current = activeStep === s.id;
          const done = activeStep > s.id || (!isSimulating && activeStep === 0);
          return (
            <Glass key={s.id} className={`p-4 transition-all ${current ? 'ring-2 ring-sky-400 bg-sky-50/50' : done ? '' : 'opacity-60'}`}>
              <div className="flex justify-between items-center text-[10px] font-mono text-sky-700 font-bold">
                Stage 0{s.id}
                {current ? <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" /> : done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : null}
              </div>
              <div className="font-bold text-sm mt-2 text-slate-900">{s.title}</div>
              <div className="mt-1">
                <span className="text-[10px] font-mono text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-semibold inline-block">{s.tech}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{s.description}</p>
              <div className="text-[10px] font-mono text-slate-500 font-medium mt-3">{s.status}</div>
            </Glass>
          );
        })}
      </div>

      <Glass className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Server className="w-4 h-4 text-sky-600" /><h3 className="font-display font-extrabold text-slate-900">MLflow registry</h3></div>
          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Production v2.4.2</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-slate-600 font-bold border-b border-sky-100">
              <tr>{['Version', 'Architecture', 'Trigger', 'MAPE', 'R²', 'Stage'].map((h) => <th key={h} className="pb-2 text-slate-800">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              <tr className="bg-sky-50/80 text-slate-900 font-semibold">
                <td className="py-2.5 px-1 font-bold text-sky-950">v2.4.2</td><td>LSTM + XGBoost</td><td>Drift &gt;8%</td><td className="text-emerald-700 font-bold">3.18%</td><td>0.962</td><td><span className="text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">Active live</span></td>
              </tr>
              <tr className="text-slate-700"><td className="py-2.5 px-1">v2.4.1</td><td>Bi-LSTM</td><td>Weekly</td><td>4.12%</td><td>0.938</td><td><span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">Rollback</span></td></tr>
              <tr className="text-slate-700"><td className="py-2.5 px-1">v2.4.0</td><td>XGBoost</td><td>Spec update</td><td>4.85%</td><td>0.924</td><td><span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[10px]">Archived</span></td></tr>
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
