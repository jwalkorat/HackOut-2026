import { Zap, ArrowUp, Sparkles, Terminal, ArrowRight } from 'lucide-react';

export default function Footer({ onOpenJudgePitch }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-dark-950 border-t border-slate-900 pt-16 pb-12 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-cyan-500/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pre-footer Closing CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/90 via-dark-900 to-dark-950 border border-cyan-500/30 backdrop-blur-xl shadow-2xl mb-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HackOut'26 Prototype Submission</span>
          </div>

          <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight max-w-2xl mx-auto">
            Ready to turn volatile renewables into firm grid baseload?
          </h3>

          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed">
            MegaByte empowers operators, plant owners, and traders to foresee output 24–72 hours ahead and execute optimal curtailment, storage, and peaker strategies.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#dashboard"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 font-display font-bold text-sm shadow-glow-cyan hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Explore Live Dashboard Mockup</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onOpenJudgePitch}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 font-medium text-sm hover:border-cyan-500/40 hover:text-white transition-all"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Review Judge Pitch Brief</span>
            </button>
          </div>
        </div>

        {/* Footer Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Team */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px] shadow-glow-cyan">
                <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="font-display font-black text-xl text-white">MegaByte</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-sans mb-4">
              AI-powered renewable generation forecasting and decision platform predicting solar and wind output 24–72 hours ahead.
            </p>

            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>Team: <strong className="text-white">MegaByte</strong></div>
              <div>Hackathon: <strong className="text-cyan-400">HackOut'26</strong></div>
              <div>Theme: <strong className="text-amber-400">Renewable Energy Intelligence</strong></div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><a href="#problem" className="hover:text-cyan-400 transition-colors">The Dilemma</a></li>
              <li><a href="#pillars" className="hover:text-cyan-400 transition-colors">Three Pillars</a></li>
              <li><a href="#dashboard" className="hover:text-cyan-400 transition-colors">Operator Dashboard</a></li>
              <li><a href="#progressive-input" className="hover:text-cyan-400 transition-colors">Progressive Input</a></li>
              <li><a href="#equipment" className="hover:text-cyan-400 transition-colors">Equipment Lookup</a></li>
              <li><a href="#mlops" className="hover:text-cyan-400 transition-colors">MLOps Retraining</a></li>
            </ul>
          </div>

          {/* Col 3: Report & Tech */}
          <div>
            <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider mb-3">
              Report Alignment
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li><span>Forecasting: Python LSTM/XGBoost</span></li>
              <li><span>MLOps: MLflow & Airflow</span></li>
              <li><span>API: FastAPI & Supabase</span></li>
              <li><span>UI: React 18, Vite & Tailwind</span></li>
              <li><span>Physics: DNI/GHI & IEC Curves</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Back-to-Top */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © 2026 Team MegaByte • Created for HackOut'26 • All Rights Reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
