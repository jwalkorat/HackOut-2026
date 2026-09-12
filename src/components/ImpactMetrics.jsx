import React from 'react';
import { Leaf, ShieldCheck, DollarSign, Users, ArrowUpRight, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function ImpactMetrics() {
  const impacts = [
    {
      metric: '-32%',
      label: 'Fossil Peaker Reliance',
      title: 'Reduces Energy Wastage & Fossil Peakers',
      desc: 'Anticipates renewable shortfall 24-72h ahead, allowing battery storage to pre-charge and reducing emergency fossil peaker startups by nearly a third.',
      subtext: '48,000+ Tons CO₂ abated annually per utility node',
      color: 'emerald',
      icon: Leaf,
    },
    {
      metric: '99.4%',
      label: 'Grid Balance Reliability',
      title: 'Improves Grid Stability & Frequency',
      desc: 'Transforms volatile swings into predictable dispatch curves, mitigating sub-second transmission frequency deviations (60.0 Hz balance).',
      subtext: 'Zero unannounced blackouts or voltage drops',
      color: 'cyan',
      icon: ShieldCheck,
    },
    {
      metric: '+18.5%',
      label: 'Producer Revenue Realized',
      title: 'Maximizes Trader & Plant Producer ROI',
      desc: 'Enables strategic day-ahead bidding into wholesale electricity markets (CAISO/ERCOT/PJM) instead of taking penalty pricing on volatile deviations.',
      subtext: 'Averts zero-dollar negative price curtailment dump',
      color: 'amber',
      icon: DollarSign,
    },
    {
      metric: '10s',
      label: 'Non-Technical Setup',
      title: 'Accessible to Non-Experts, Always Current',
      desc: 'Layer 1 input requires only 3 intuitive fields with curated fallback defaults, while the self-healing MLOps loop continually adapts to new equipment.',
      subtext: 'Zero barrier to entry with enterprise-grade depth',
      color: 'cyan',
      icon: Users,
    },
  ];

  return (
    <section id="impact" className="relative py-24 bg-dark-950/90 border-t border-slate-900 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quantified Impact (Section 6)</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            Real-World Environmental & <br />
            <span className="text-gradient-hybrid">Economic Transformation</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
            The transition to clean energy isn't just about building panels and turbines — it's about 
            making them dependable enough to run the world's grids without fossil backup.
          </p>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {impacts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-dark-900/80 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
                      Impact 0{idx + 1}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
                      {item.metric}
                    </div>
                    <div className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider mt-1">
                      {item.label}
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed font-sans mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item.subtext}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
