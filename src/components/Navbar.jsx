import React, { useState } from 'react';
import { Zap, Activity, Cpu, ShieldCheck, Menu, X, ArrowUpRight, Terminal } from 'lucide-react';

export default function Navbar({ onOpenJudgePitch }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-dark-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Hackathon Tag */}
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-400 p-[2px] shadow-glow-cyan transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-400 group-hover:text-amber-300 transition-colors" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-2xl tracking-tight text-white">MegaByte</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    v2.4 AI
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                  <span>HackOut'26</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-amber-400/90 font-medium">Renewable Energy Intelligence</span>
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <a href="#problem" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              The Problem
            </a>
            <a href="#pillars" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Three Pillars
            </a>
            <a href="#dashboard" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Live Dashboard
            </a>
            <a href="#progressive-input" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Progressive Input
            </a>
            <a href="#equipment" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Equipment Lookup
            </a>
            <a href="#mlops" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              MLOps Loop
            </a>
            <a href="#tech-stack" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Tech Stack
            </a>
            <a href="#impact" className="px-3.5 py-2 rounded-lg text-sm text-slate-300 hover:text-cyan-400 hover:bg-slate-850/60 transition-colors">
              Impact
            </a>
          </nav>

          {/* Right Action: Pitch Modal & Live Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CAISO / ERCOT Live Feeds</span>
            </div>

            <button
              onClick={onOpenJudgePitch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-dark-950 font-display font-bold text-xs tracking-wide uppercase shadow-glow-cyan hover:brightness-110 active:scale-95 transition-all"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Judge Pitch Deck</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-dark-950 px-4 pt-3 pb-6 space-y-2">
          <a
            href="#problem"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            The Problem
          </a>
          <a
            href="#pillars"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Three Pillars
          </a>
          <a
            href="#dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Live Dashboard
          </a>
          <a
            href="#progressive-input"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Progressive Input Demo
          </a>
          <a
            href="#equipment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Equipment Lookup & Defaults
          </a>
          <a
            href="#mlops"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            MLOps Self-Healing Loop
          </a>
          <a
            href="#tech-stack"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Tech Stack Architecture
          </a>
          <a
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base text-slate-200 hover:bg-slate-900"
          >
            Impact & Metrics
          </a>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenJudgePitch();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-dark-950 font-bold text-sm shadow-glow-cyan"
            >
              <span>Judge Pitch Deck (2-Min Brief)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
