import React from 'react';
import { User, Award, PenTool, Cpu, Download, ArrowUpRight, Compass, Sparkles } from 'lucide-react';

export default function AboutSection({ profile }) {
  return (
    <section id="about" className="py-24 relative bg-[var(--bg-main)] overflow-hidden transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10 space-y-16">
        
        {/* Section Heading */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pill-bg)] border border-[var(--border-color)] text-amber-500 text-xs font-mono font-medium">
            <User className="w-3.5 h-3.5" />
            <span>The Artisan &amp; Designer</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
            About Yashraj
          </h2>
          <p className="text-sm md:text-base text-[var(--text-subtle)] max-w-2xl font-light">
            Graphic Designer, Visual Artist, and multidisciplinary brand craftsman bridging the sacred tactile past with contemporary visual identity.
          </p>
        </div>

        {/* Narrative & Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Portrait Card & Key Attributes */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--border-color)] p-3 shadow-2xl group">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-black/20 dark:bg-black/40">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)]/80 via-transparent to-transparent opacity-80" />

                {/* Badge Overlay */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 space-y-1 text-white">
                  <div className="font-display font-bold text-base">{profile.name}</div>
                  <div className="text-xs font-mono text-amber-400">{profile.designation} &middot; Visual Artist</div>
                  <div className="text-[11px] text-slate-300">{profile.location}</div>
                </div>
              </div>
            </div>

            {/* Resume & CV Action */}
            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-[var(--text-subtle)] uppercase">Curriculum Vitae</div>
                <div className="text-sm font-semibold text-[var(--text-heading)]">Full Design Credentials</div>
              </div>
              <a
                href={profile.resumeUrl || "#"}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV</span>
              </a>
            </div>
          </div>

          {/* Right Column: Creative Manifesto, Toolkits & Milestones */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Bio Story */}
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-[var(--text-heading)]">
                "Where tactile ink &amp; paper meets modern brand identity."
              </h3>
              <p className="text-[var(--text-body)] text-sm md:text-base leading-relaxed font-light">
                {profile.bio}
              </p>
              <p className="text-[var(--text-subtle)] text-sm leading-relaxed font-light">
                Whether hand-carving calligraphy pens from bamboo, testing structural packaging folding nets on 300gsm cotton cardstock, or engineering custom ligature typefaces in digital font editors, every project is treated as an enduring piece of visual literature.
              </p>
            </div>

            {/* Multidisciplinary Toolkits Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
              
              {/* Analog Crafts */}
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2 text-amber-500 text-xs font-mono uppercase tracking-wider font-semibold">
                  <PenTool className="w-4 h-4" />
                  <span>Analog &amp; Tactile Mastery</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.analog.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-body)]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Digital Tools */}
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2 text-sky-500 text-xs font-mono uppercase tracking-wider font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>Digital Software Standards</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {profile.skills.digital.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-body)]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Career Timeline */}
            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>Selected Milestones &amp; History</span>
              </div>
              <div className="space-y-3">
                {profile.experienceTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] hover:border-amber-500/30 transition-colors">
                    <span className="text-xs font-mono font-bold text-amber-500 w-24 flex-shrink-0 pt-0.5">
                      {item.year}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-heading)]">{item.title}</div>
                      <div className="text-xs text-[var(--text-subtle)]">{item.org}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
