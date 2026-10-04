import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Box, Compass, PenTool, Sparkles, BookOpen, Award, CheckCircle2, 
  Sun, Moon, ShieldCheck, Download, Share2
} from 'lucide-react';
import SpatialScanner3D from './SpatialScanner3D';
import OrthographicEngine from './OrthographicEngine';
import ConceptSketchStudio from './ConceptSketchStudio';
import { CEED_EXAM_TIPS } from './ceedPresets';
import { useTheme } from '../../context/ThemeContext';

export default function CeedLabPage({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState('spatial'); // 'spatial' | 'ortho' | 'sketch'
  const [showTips, setShowTips] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tabs = [
    {
      id: 'spatial',
      name: '2D-to-3D Spatial Scanner',
      icon: Box,
      tag: 'Part A & Spatial Aptitude',
      desc: 'Paste any image (Ctrl+V) or upload photo to generate 360° watertight 3D solid model with zoom & wireframe.'
    },
    {
      id: 'ortho',
      name: 'Orthographic Multi-View Engine',
      icon: Compass,
      tag: 'Engineering Drafting ISO',
      desc: 'Generate Front, Top, Side & 3D Isometric views with 1st/3rd angle projection switcher & miter alignment rays.'
    },
    {
      id: 'sketch',
      name: 'AI Concept Sketch & Perspective Studio',
      icon: PenTool,
      tag: 'Part B Industrial Sketching',
      desc: 'Prompt-based industrial design sketch generator with 1/2/3-point perspective grid overlays & drawing canvas.'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-body)] transition-colors duration-300 selection:bg-amber-500 selection:text-black">
      
      {/* Dedicated Lab Header Navigation Bar */}
      <header className="sticky top-0 left-0 right-0 z-50 py-3.5 px-5 md:px-8 bg-[var(--bg-nav)] backdrop-blur-xl border-b border-[var(--border-color)] shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Back to Portfolio CTA */}
          <button
            onClick={onBackToHome}
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] hover:border-amber-500/50 text-xs font-mono text-[var(--text-heading)] transition-all shadow-sm active:scale-95"
            title="Return to Yashraj's Graphic Design Portfolio"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Portfolio</span>
          </button>

          {/* Central Title */}
          <div className="flex items-center gap-3">
            <div className="h-8 px-2.5 rounded-xl bg-slate-900/80 dark:bg-black/80 border border-amber-500/30 flex items-center justify-center shadow-md">
              <img src="/yashraj_logo.png" alt="Yashraj" className="h-5 w-auto object-contain" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-display font-bold text-[var(--text-heading)]">
                Yashraj &middot; CEED Design Lab
              </div>
              <div className="text-[10px] font-mono text-amber-500">
                Spatial Computing &amp; AI Tools
              </div>
            </div>
          </div>

          {/* Right Actions: Theme Toggle & CEED Tips */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-mono font-semibold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CEED Cheat-Sheet</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-heading)] hover:border-amber-500/40 transition-all"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Page Content */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 space-y-10">
        
        {/* Lab Hero Banner */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated IIT M.Des / CEED Spatial Studio</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Spatial Computing &amp; AI Design Tools
          </h1>

          <p className="text-sm md:text-base text-[var(--text-subtle)] font-light leading-relaxed">
            A specialized experimental suite for industrial design aspirants: reconstruct 2D images into interactive 360° 3D models, generate engineering orthographic projections, and construct perspective sketches with guided grids.
          </p>
        </div>

        {/* Collapsible CEED Ranker Cheat-Sheet */}
        {showTips && (
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-amber-500/5 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 font-display font-bold text-base">
                <Award className="w-5 h-5" />
                <span>CEED Master Spatial &amp; Sketching Guidelines</span>
              </div>
              <span className="text-xs font-mono text-[var(--text-subtle)]">Curated for IIT M.Des Aspirants</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CEED_EXAM_TIPS.map((sec, idx) => (
                <div key={idx} className="space-y-3 p-4 rounded-2xl bg-[var(--pill-bg)] border border-[var(--border-color)]">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{sec.category}</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[var(--text-body)] font-light leading-relaxed">
                    {sec.tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">&bull;</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Studio Tool Switcher Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between gap-3 group ${
                  isActive
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-[var(--border-color)] bg-[var(--pill-bg)] hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive ? 'bg-amber-500 text-black shadow-md' : 'bg-black/20 text-amber-500 group-hover:scale-105'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--pill-bg)] border border-[var(--border-color)] text-[var(--text-subtle)]">
                    {tab.tag}
                  </span>
                </div>

                <div>
                  <h3 className={`font-display font-bold text-sm transition-colors ${
                    isActive ? 'text-amber-500' : 'text-[var(--text-heading)] group-hover:text-amber-500'
                  }`}>
                    {tab.name}
                  </h3>
                  <p className="text-[11px] text-[var(--text-subtle)] line-clamp-2 mt-1 leading-relaxed">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Tool Viewport */}
        <div className="pt-2">
          {activeTab === 'spatial' && <SpatialScanner3D />}
          {activeTab === 'ortho' && <OrthographicEngine />}
          {activeTab === 'sketch' && <ConceptSketchStudio />}
        </div>

      </main>

      {/* Lab Dedicated Footer */}
      <footer className="mt-20 py-8 border-t border-[var(--border-color)] text-center text-xs font-mono text-[var(--text-subtle)]">
        <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Yashraj &middot; CEED Design Innovation Lab
          </div>
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio Main Page</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
