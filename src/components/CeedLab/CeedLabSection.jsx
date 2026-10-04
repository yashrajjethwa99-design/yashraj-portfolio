import React, { useState } from 'react';
import { Box, Compass, PenTool, Sparkles, Maximize2, Minimize2, Info, ChevronDown, ChevronUp, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import SpatialScanner3D from './SpatialScanner3D';
import OrthographicEngine from './OrthographicEngine';
import ConceptSketchStudio from './ConceptSketchStudio';
import { CEED_EXAM_TIPS } from './ceedPresets';

export default function CeedLabSection() {
  const [activeTab, setActiveTab] = useState('spatial'); // 'spatial' | 'ortho' | 'sketch'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const tabs = [
    {
      id: 'spatial',
      name: '2D-to-3D Spatial Scanner',
      icon: Box,
      tag: 'Part A & Spatial Reasoning',
      desc: 'Convert any 2D photo into a true 3D spatial mesh with 360° orbit, wireframe topology, depth heatmap & zoom controls.'
    },
    {
      id: 'ortho',
      name: 'Orthographic Multi-View Engine',
      icon: Compass,
      tag: 'Engineering Multi-View Projection',
      desc: 'Generate Front, Top, Side & 3D Isometric projections with 1st/3rd angle ISO toggle, alignment rays & dimension callouts.'
    },
    {
      id: 'sketch',
      name: 'AI Concept Sketch & Perspective Studio',
      icon: PenTool,
      tag: 'Part B Industrial Sketching',
      desc: 'Prompt-driven industrial design sketching with interactive 1/2/3-point perspective grid overlays & drawing canvas.'
    }
  ];

  return (
    <section 
      id="ceed-lab" 
      className={`relative py-24 transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-[var(--bg-main)] overflow-y-auto p-6 md:p-10' 
          : 'bg-gradient-to-b from-[var(--bg-main)] via-[var(--bg-surface)] to-[var(--bg-main)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CEED &amp; Industrial Design Innovation Lab</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Spatial Visualization &amp; AI Design Tools
            </h2>
            <p className="text-sm md:text-base text-[var(--text-subtle)] font-light leading-relaxed">
              Purpose-built spatial computing, multi-view orthographic geometry, and perspective design tools developed for CEED / UCEED entrance preparation and industrial product design workflows.
            </p>
          </div>

          {/* Action CTAs: Fullscreen & CEED Tips Drawer */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-mono font-semibold transition-all shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>CEED Ranker Tips</span>
              {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-heading)] hover:border-amber-500/40 text-xs font-mono transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen Studio'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-500" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Studio Mode'}</span>
            </button>
          </div>
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

        {/* Tool Navigation Tabs Bar */}
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
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10'
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

        {/* Dynamic Tool Workspace */}
        <div className="pt-2">
          {activeTab === 'spatial' && <SpatialScanner3D />}
          {activeTab === 'ortho' && <OrthographicEngine />}
          {activeTab === 'sketch' && <ConceptSketchStudio />}
        </div>

      </div>
    </section>
  );
}
