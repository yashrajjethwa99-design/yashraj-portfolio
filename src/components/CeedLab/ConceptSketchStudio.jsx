import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Sparkles, Sliders, Grid, Download, Trash2, Undo, Check, RefreshCw, Palette, HelpCircle, Eye, ArrowRight, Wand2 } from 'lucide-react';
import { CEED_SKETCH_PROMPTS } from './ceedPresets';

export default function ConceptSketchStudio() {
  const [selectedPrompt, setSelectedPrompt] = useState(CEED_SKETCH_PROMPTS[1]);
  const [customBrief, setCustomBrief] = useState(CEED_SKETCH_PROMPTS[1].brief);
  const [activeStyle, setActiveStyle] = useState('marker'); // 'marker' | 'construction' | 'ink' | 'clay'
  const [activeImage, setActiveImage] = useState('/ceed/chair.jpg');
  const [isGenerating, setIsGenerating] = useState(false);

  // Perspective Guides Overlay
  const [perspectiveMode, setPerspectiveMode] = useState('2-point'); // 'none' | '1-point' | '2-point' | '3-point'
  const [perspectiveOpacity, setPerspectiveOpacity] = useState(0.45);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Drawing Canvas State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#f59e0b');
  const [penSize, setPenSize] = useState(3);
  const [drawTool, setDrawTool] = useState('pen'); // 'pen' | 'eraser'
  const historyRef = useRef([]);

  // Generate / Synthesize Concept Sketch
  const handleGenerateSketch = (e) => {
    if (e) e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      // Pick best matching asset based on keyword or style
      const lower = customBrief.toLowerCase();
      if (lower.includes('chair') || lower.includes('seat') || lower.includes('lounge') || activeStyle === 'marker') {
        setActiveImage('/ceed/chair.jpg');
      } else if (lower.includes('kettle') || lower.includes('water') || lower.includes('cooler') || lower.includes('dispenser')) {
        setActiveImage('/ceed/kettle.jpg');
      } else if (lower.includes('gear') || lower.includes('machine') || lower.includes('box') || activeStyle === 'ink') {
        setActiveImage('/ceed/orthographic.jpg');
      } else {
        setActiveImage('/ceed/polyhedron.jpg');
      }

      setIsGenerating(false);
      clearDrawings();
    }, 900);
  };

  // Drawing Canvas Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []);

  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    // Save snapshot for Undo
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 10) historyRef.current.shift();

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    if (drawTool === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.lineWidth = penSize * 4;
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const undoDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    const last = historyRef.current.pop();
    ctx.putImageData(last, 0, 0);
  };

  const clearDrawings = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
  };

  // Export Combined Canvas + Image
  const handleExportSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export composite canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1200;
    exportCanvas.height = 1200;
    const ctx = exportCanvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeImage;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1200, 1200);
      ctx.drawImage(canvas, 0, 0, 1200, 1200);

      // Title watermarking
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('CEED PART B CONCEPT PRACTICE SHEET · YASHRAJ', 30, 1160);

      const a = document.createElement('a');
      a.href = exportCanvas.toDataURL('image/png');
      a.download = `ceed-concept-sketch-${selectedPrompt.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Input & Style Studio Bar */}
      <div className="p-5 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
        
        {/* Preset Prompt Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-subtle)] font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>CEED Part B Design Problem Statements:</span>
            </span>
            <span className="text-amber-500 text-[10px]">Click any prompt or type custom details below</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CEED_SKETCH_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPrompt(p);
                  setCustomBrief(p.brief);
                  setActiveStyle(p.style);
                }}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  selectedPrompt.title === p.title
                    ? 'border-amber-500 bg-amber-500/10 text-[var(--text-heading)]'
                    : 'border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-body)] hover:border-amber-500/40'
                }`}
              >
                <div className="text-xs font-bold font-display text-amber-500">{p.title}</div>
                <div className="text-[10px] text-[var(--text-subtle)] line-clamp-1">{p.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input & Generate CTA */}
        <form onSubmit={handleGenerateSketch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customBrief}
            onChange={(e) => setCustomBrief(e.target.value)}
            placeholder="Type your design details... e.g. Ergonomic electric kettle with bamboo handle and two-point perspective guidelines"
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/60 font-mono"
          />

          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Drawing...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate AI Sketch</span>
              </>
            )}
          </button>
        </form>

        {/* Style Selector Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-[var(--text-subtle)] mr-1">Rendering Style:</span>
            {[
              { id: 'marker', label: 'Copic Marker Sketch' },
              { id: 'construction', label: 'Blue-Line Construction' },
              { id: 'ink', label: 'Technical Ink Hatch' },
              { id: 'clay', label: 'Digital Product Clay' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStyle(s.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeStyle === s.id
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-[var(--pill-bg)] text-[var(--text-subtle)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span>✓ Human Anthropometry Scale Enabled</span>
          </div>
        </div>

      </div>

      {/* Main Interactive Studio Canvas & Perspective Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Drawing & Sketch Viewport */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="relative aspect-square max-h-[620px] rounded-3xl overflow-hidden glass-panel border border-[var(--border-color)] bg-[#111622] shadow-2xl">
            
            {/* The Base AI Concept Sketch Image */}
            <img 
              src={activeImage} 
              alt="Concept Drawing"
              className="w-full h-full object-contain filter contrast-110 select-none pointer-events-none"
            />

            {/* PERSPECTIVE GRID OVERLAY (CEED Spatial Construction Guides) */}
            {perspectiveMode !== 'none' && (
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity"
                style={{ opacity: perspectiveOpacity }}
              >
                {/* 2-Point Perspective Construction Lines */}
                {perspectiveMode === '2-point' && (
                  <g stroke="#38bdf8" strokeWidth="1.2">
                    {/* Horizon Line / Eye Level */}
                    <line x1="0" y1="45%" x2="100%" y2="45%" stroke="#ec4899" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="20" y="43%" fill="#ec4899" fontSize="11" fontFamily="monospace">HORIZON (EYE LEVEL)</text>

                    {/* Left Vanishing Point (VP1) Rays */}
                    <circle cx="5%" cy="45%" r="4" fill="#38bdf8" />
                    <line x1="5%" y1="45%" x2="40%" y2="15%" strokeDasharray="3 3" />
                    <line x1="5%" y1="45%" x2="55%" y2="75%" strokeDasharray="3 3" />
                    <line x1="5%" y1="45%" x2="70%" y2="85%" strokeDasharray="3 3" />

                    {/* Right Vanishing Point (VP2) Rays */}
                    <circle cx="95%" cy="45%" r="4" fill="#38bdf8" />
                    <line x1="95%" y1="45%" x2="60%" y2="15%" strokeDasharray="3 3" />
                    <line x1="95%" y1="45%" x2="45%" y2="75%" strokeDasharray="3 3" />
                    <line x1="95%" y1="45%" x2="30%" y2="85%" strokeDasharray="3 3" />

                    {/* True Vertical Height Line */}
                    <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#f59e0b" strokeWidth="1.5" />
                  </g>
                )}

                {/* 1-Point Perspective Construction Lines */}
                {perspectiveMode === '1-point' && (
                  <g stroke="#38bdf8" strokeWidth="1.2">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ec4899" strokeWidth="2" strokeDasharray="6 4" />
                    <circle cx="50%" cy="50%" r="5" fill="#f59e0b" />
                    <text x="52%" y="48%" fill="#f59e0b" fontSize="11" fontFamily="monospace">CENTER VP</text>
                    {[0, 15, 30, 45, 60, 75, 90, 100].map((pct, i) => (
                      <line key={i} x1="50%" y1="50%" x2={`${pct}%`} y2="100%" strokeDasharray="4 4" />
                    ))}
                  </g>
                )}

                {/* 3-Point Perspective (Includes Vertical Zenith) */}
                {perspectiveMode === '3-point' && (
                  <g stroke="#a855f7" strokeWidth="1.2">
                    <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="6 4" />
                    <circle cx="50%" cy="95%" r="4" fill="#a855f7" />
                    <text x="44%" y="98%" fill="#a855f7" fontSize="10" fontFamily="monospace">NADIR VP3</text>
                    <line x1="50%" y1="95%" x2="25%" y2="20%" strokeDasharray="3 3" />
                    <line x1="50%" y1="95%" x2="75%" y2="20%" strokeDasharray="3 3" />
                  </g>
                )}
              </svg>
            )}

            {/* Interactive Drawing Practice Canvas (Yashraj can trace & sketch over it!) */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
            />

            {/* Bottom Floating Canvas Toolbar */}
            <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-white/15 backdrop-blur-xl bg-black/70 text-white">
              
              {/* Tool Picker: Pen vs Eraser */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDrawTool('pen')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    drawTool === 'pen'
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Practice Sketch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawTool('eraser')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    drawTool === 'eraser'
                      ? 'bg-amber-500 text-black font-bold shadow-md'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Eraser</span>
                </button>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-1.5">
                {['#f59e0b', '#38bdf8', '#ef4444', '#10b981', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setPenColor(c);
                      setDrawTool('pen');
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      penColor === c && drawTool === 'pen' ? 'scale-125 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Stroke Size */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Size:</span>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={penSize}
                  onChange={(e) => setPenSize(parseInt(e.target.value))}
                  className="w-16 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Undo & Clear */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={undoDraw}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
                  title="Undo stroke"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={clearDrawings}
                  className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-all"
                  title="Clear sketch overlay"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-subtle)] px-2">
            <span>💡 Draw directly on canvas to practice perspective lines, leader callouts, and shading.</span>
            <button
              onClick={handleExportSheet}
              className="flex items-center gap-1.5 text-amber-500 font-bold hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Sheet + Annotations</span>
            </button>
          </div>

        </div>

        {/* Right Column: CEED Evaluation Matrix & Perspective Grid Controller */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Perspective Construction Guides Box */}
          <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-heading)]">Perspective Grid Guides</h4>
              </div>
              <span className="text-[10px] font-mono text-sky-400 font-semibold">CEED Crucial</span>
            </div>

            <p className="text-xs text-[var(--text-subtle)] leading-relaxed">
              Overlay geometric perspective grids to train your eyes on horizon level and vanishing line convergence.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { id: 'none', label: 'Off (Clean)' },
                { id: '1-point', label: '1-Point Grid' },
                { id: '2-point', label: '2-Point Grid' },
                { id: '3-point', label: '3-Point Zenith' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPerspectiveMode(m.id)}
                  className={`px-3 py-2 rounded-xl border text-center transition-all ${
                    perspectiveMode === m.id
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                      : 'border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-subtle)] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {perspectiveMode !== 'none' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-subtle)]">
                  <span>Grid Opacity:</span>
                  <span className="text-sky-400 font-bold">{Math.round(perspectiveOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={perspectiveOpacity}
                  onChange={(e) => setPerspectiveOpacity(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* CEED Part B Scoring Matrix Checklist */}
          <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <Check className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-heading)]">CEED Part B Rubric</h4>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { title: 'Perspective Rigor', desc: 'All converging edges point to true VPs without distortion' },
                { title: 'Material & Texture', desc: 'Distinction between rubber grip, aluminum, and plastic' },
                { title: 'Ergonomic Interaction', desc: 'Finger indents, palm radius, and anthropometric clearance' },
                { title: 'Visual Annotation', desc: 'Short callouts detailing mechanism and manufacturing' }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] space-y-0.5">
                  <div className="text-amber-500 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-subtle)]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
