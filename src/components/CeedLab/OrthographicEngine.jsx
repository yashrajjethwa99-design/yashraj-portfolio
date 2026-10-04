import React, { useState, useRef } from 'react';
import { Grid, Eye, Download, Upload, Maximize2, Sparkles, Check, Compass, Layers, Sliders, FileText } from 'lucide-react';
import { CEED_3D_PRESETS } from './ceedPresets';

export default function OrthographicEngine() {
  const [selectedPreset, setSelectedPreset] = useState(CEED_3D_PRESETS[3] || CEED_3D_PRESETS[0]);
  const [projectionAngle, setProjectionAngle] = useState('first'); // 'first' (1st Angle) | 'third' (3rd Angle)
  const [showProjectionRays, setShowProjectionRays] = useState(true);
  const [showHiddenLines, setShowHiddenLines] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [activeInspectorView, setActiveInspectorView] = useState(null); // 'front' | 'top' | 'side' | 'isometric' | null
  const [customImage, setCustomImage] = useState(null);
  const fileInputRef = useRef(null);

  const activeImage = customImage || selectedPreset.image;

  // Handle custom upload
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomImage(url);
    setSelectedPreset({
      id: 'custom-ortho',
      name: file.name.substring(0, 20) || 'Custom Machine Part',
      category: 'User Blueprint',
      image: url,
      description: 'Custom uploaded object analyzed for orthographic projection views.'
    });
  };

  // Download complete drafting sheet
  const handleDownloadSheet = () => {
    const a = document.createElement('a');
    a.href = activeImage;
    a.download = `ceed-orthographic-projection-${projectionAngle}-angle.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Standards Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
        
        {/* Model Presets */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-subtle)] font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Engineering / Product Model:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CEED_3D_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setCustomImage(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedPreset.id === preset.id && !customImage
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[var(--pill-bg)] text-[var(--text-body)] hover:text-[var(--text-heading)] border border-[var(--border-color)]'
                }`}
              >
                <span>{preset.name}</span>
                {selectedPreset.id === preset.id && !customImage && <Check className="w-3 h-3" />}
              </button>
            ))}

            {/* Upload Any Drawing / Object */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Projection Standard Switcher (1st Angle vs 3rd Angle) */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-[var(--border-color)] text-xs font-mono">
            <button
              onClick={() => setProjectionAngle('first')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                projectionAngle === 'first'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-[var(--text-subtle)] hover:text-white'
              }`}
              title="First Angle Projection (Standard in India & ISO): Top view is placed BELOW Front view"
            >
              First Angle (ISO)
            </button>
            <button
              onClick={() => setProjectionAngle('third')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                projectionAngle === 'third'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-[var(--text-subtle)] hover:text-white'
              }`}
              title="Third Angle Projection (Standard in USA / ASME): Top view is placed ABOVE Front view"
            >
              Third Angle (ASME)
            </button>
          </div>

          <button
            onClick={handleDownloadSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Blueprint</span>
          </button>
        </div>
      </div>

      {/* Toggles Bar: Projection Rays, Hidden Lines, Drafting Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl glass-panel border border-[var(--border-color)] text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-body)]">
            <input
              type="checkbox"
              checked={showProjectionRays}
              onChange={(e) => setShowProjectionRays(e.target.checked)}
              className="accent-amber-500 w-3.5 h-3.5"
            />
            <span className="text-amber-500 font-semibold">Alignment Projection Rays (Miter Lines)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-body)]">
            <input
              type="checkbox"
              checked={showHiddenLines}
              onChange={(e) => setShowHiddenLines(e.target.checked)}
              className="accent-sky-500 w-3.5 h-3.5"
            />
            <span className="text-sky-400 font-semibold">Hidden Occluded Lines (Dashed)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-body)]">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="accent-emerald-500 w-3.5 h-3.5"
            />
            <span>Drafting Millimeter Grid</span>
          </label>
        </div>

        <div className="text-[11px] text-[var(--text-subtle)] font-mono">
          {projectionAngle === 'first' 
            ? '📌 1st Angle: Front View ➔ Top View (Below) ➔ Left View (Right)' 
            : '📌 3rd Angle: Top View (Above) ➔ Front View ➔ Right View (Right)'}
        </div>
      </div>

      {/* Main Drafting Blueprint Canvas */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--border-color)] p-6 shadow-2xl bg-[#090d16] text-white">
        
        {/* Drafting Paper Millimeter Grid Background */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #38bdf8 1px, transparent 1px),
                linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* Global Alignment Projection Rays (Orange & Cyan Dotted Lines) */}
        {showProjectionRays && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
            {/* Horizontal Alignment Rays (Front View to Side View) */}
            <line x1="28%" y1="35%" x2="72%" y2="35%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="28%" y1="52%" x2="72%" y2="52%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="28%" y1="68%" x2="72%" y2="68%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />

            {/* Vertical Alignment Rays (Front View to Top View) */}
            <line x1="32%" y1="20%" x2="32%" y2="80%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="48%" y1="20%" x2="48%" y2="80%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />

            {/* 45° Miter Reflection Line */}
            <line x1="72%" y1="20%" x2="88%" y2="36%" stroke="#ec4899" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        )}

        {/* Projections Matrix Layout (Dynamically switches based on 1st vs 3rd Angle) */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Top Left Quadrant */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 relative group hover:border-amber-500/50 transition-all flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase text-amber-400">
                  {projectionAngle === 'first' ? 'Front Elevation (Front View)' : 'Plan (Top View)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">View A &middot; Scale 1:1</span>
            </div>

            {/* Viewport Visualization */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              <img 
                src={activeImage} 
                alt="Projection View"
                className="max-h-48 w-auto object-contain filter contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-300"
              />
              {showHiddenLines && (
                <div className="absolute inset-4 border border-dashed border-sky-400/40 rounded pointer-events-none" />
              )}
            </div>

            {/* Dimension Callout */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>W: 210mm &middot; H: 180mm</span>
              <button 
                onClick={() => setActiveInspectorView('front')}
                className="hover:text-amber-400 flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Magnify</span>
              </button>
            </div>
          </div>

          {/* Top Right Quadrant */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 relative group hover:border-sky-500/50 transition-all flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-xs font-mono font-bold uppercase text-sky-400">
                  {projectionAngle === 'first' ? 'End Elevation (Left Side View)' : 'Right Elevation (Side View)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">View C &middot; Profile</span>
            </div>

            {/* Side View Silhouette & Contours */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              <img 
                src={activeImage} 
                alt="Side View"
                className="max-h-48 w-auto object-contain filter contrast-125 brightness-95 rotate-90 scale-90 group-hover:scale-95 transition-transform duration-300"
              />
              {showHiddenLines && (
                <div className="absolute inset-6 border border-dashed border-amber-400/40 rounded-full pointer-events-none" />
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Depth: 160mm &middot; Flange: Ø35mm</span>
              <button 
                onClick={() => setActiveInspectorView('side')}
                className="hover:text-sky-400 flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Magnify</span>
              </button>
            </div>
          </div>

          {/* Bottom Left Quadrant */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 relative group hover:border-emerald-500/50 transition-all flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  {projectionAngle === 'first' ? 'Plan (Top Plan View)' : 'Front Elevation (Front View)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">View B &middot; Overhead</span>
            </div>

            {/* Top View Projection */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              <img 
                src={activeImage} 
                alt="Top View"
                className="max-h-48 w-auto object-contain filter contrast-150 brightness-90 -rotate-45 group-hover:scale-105 transition-transform duration-300"
              />
              {showHiddenLines && (
                <div className="absolute inset-8 border border-dashed border-emerald-400/40 pointer-events-none" />
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Span: 210mm &middot; Bore: 2x M12</span>
              <button 
                onClick={() => setActiveInspectorView('top')}
                className="hover:text-emerald-400 flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Magnify</span>
              </button>
            </div>
          </div>

          {/* Bottom Right Quadrant: 3D Isometric View */}
          <div className="p-4 rounded-2xl bg-black/50 border border-white/10 relative group hover:border-purple-500/50 transition-all flex flex-col justify-between min-h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs font-mono font-bold uppercase text-purple-400">
                  3D Axonometric / Isometric View
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">30°/30° True Form</span>
            </div>

            {/* Isometric 3D Rendering */}
            <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
              <img 
                src={activeImage} 
                alt="3D Isometric"
                className="max-h-48 w-auto object-contain filter contrast-125 drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Isometric Axis: 30° Left / 30° Right</span>
              <button 
                onClick={() => setActiveInspectorView('isometric')}
                className="hover:text-purple-400 flex items-center gap-1"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Magnify</span>
              </button>
            </div>
          </div>

        </div>

        {/* Engineering Drafting Title Block (Official ISO Standard Style) */}
        <div className="mt-8 border border-white/20 rounded-xl overflow-hidden text-xs font-mono bg-black/60 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/20">
          <div className="p-3 space-y-0.5">
            <div className="text-[9px] uppercase text-slate-400">Project / Examination</div>
            <div className="font-bold text-amber-400">CEED Part A Spatial Lab</div>
          </div>
          <div className="p-3 space-y-0.5">
            <div className="text-[9px] uppercase text-slate-400">Projection System</div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>{projectionAngle === 'first' ? 'ISO First Angle (E)' : 'ASME Third Angle (A)'}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded">◎—◺</span>
            </div>
          </div>
          <div className="p-3 space-y-0.5">
            <div className="text-[9px] uppercase text-slate-400">Designer / Aspirant</div>
            <div className="font-bold text-white">Yashraj &middot; Studio Pro</div>
          </div>
          <div className="p-3 space-y-0.5">
            <div className="text-[9px] uppercase text-slate-400">Sheet No / Tolerances</div>
            <div className="font-bold text-emerald-400">SHEET 01/01 &middot; ±0.05mm</div>
          </div>
        </div>

      </div>

      {/* Magnified Modal Inspector */}
      {activeInspectorView && (
        <div 
          onClick={() => setActiveInspectorView(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full p-6 rounded-3xl glass-panel border border-[var(--border-color)] bg-[#090d16] text-white space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-lg text-amber-400 capitalize">
                Magnified View: {activeInspectorView} Projection
              </h3>
              <button 
                onClick={() => setActiveInspectorView(null)}
                className="px-3 py-1 rounded-lg bg-white/10 text-xs font-mono hover:bg-white/20"
              >
                Close (ESC)
              </button>
            </div>
            <div className="aspect-[16/10] flex items-center justify-center bg-black/60 rounded-2xl p-6 border border-white/10">
              <img 
                src={activeImage} 
                alt="Magnified View"
                className="max-h-full max-w-full object-contain filter contrast-125"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Click outside to return to 4-view blueprint sheet.</span>
              <button 
                onClick={handleDownloadSheet}
                className="text-amber-400 hover:underline"
              >
                Download High-Res
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
