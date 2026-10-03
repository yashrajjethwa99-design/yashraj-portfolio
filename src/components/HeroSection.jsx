import React from 'react';
import { ArrowDown, Sparkles, ExternalLink, Compass, PenTool, CheckCircle, ShieldCheck, User } from 'lucide-react';
import ThreeHeroCanvas from './ThreeHeroCanvas';
import MarqueeBanner from './MarqueeBanner';

export default function HeroSection({ profile }) {
  return (
    <section className="relative min-h-screen pt-28 pb-12 flex flex-col justify-between overflow-hidden bg-grid-pattern">
      
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 w-full relative z-10 flex-1 flex items-center py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
          
          {/* Left Column: Typography & Intent */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Designation Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-semibold tracking-wider uppercase backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>{profile.designation} &middot; Visual Artist &amp; Brand Specialist</span>
            </div>

            {/* Main Title with Shimmer & Editorial Highlights */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-heading)] leading-[1.08] tracking-tight">
              Crafting <span className="text-shimmer">Visual Identities</span>, 
              Tactile <span className="font-serif-italic font-normal text-amber-600 dark:text-amber-300">Packaging</span> &amp; Sacred Typography.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-body)] max-w-2xl font-light leading-relaxed">
              {profile.heroSubheadline}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#works"
                className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95"
              >
                <span>Explore Works &amp; Disciplines</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </a>

              <a
                href="#about"
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl border border-[var(--border-color)] hover:border-amber-500/40 bg-[var(--pill-bg)] text-[var(--text-heading)] font-medium text-sm transition-all backdrop-blur-md shadow-sm"
              >
                <User className="w-4 h-4 text-amber-500" />
                <span>About Yashraj &amp; Craft</span>
              </a>
            </div>

            {/* Disciplines & Highlights Badge Row */}
            <div className="pt-6 border-t border-[var(--border-color)] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-[var(--text-heading)]">07</div>
                <div className="text-xs text-[var(--text-subtle)] font-mono">Core Disciplines</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-amber-500">50+</div>
                <div className="text-xs text-[var(--text-subtle)] font-mono">Brand Systems Built</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-[var(--text-heading)]">06+</div>
                <div className="text-xs text-[var(--text-subtle)] font-mono">Years Studio Practice</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-sky-500">100%</div>
                <div className="text-xs text-[var(--text-subtle)] font-mono">Tactile &amp; Bespoke</div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Interactive Canvas + FLOATING BANNER SIDE ANIMATIONS */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
            
            {/* The Three.js 3D WebGL Canvas */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <ThreeHeroCanvas />
            </div>

            {/* --- FLOATING BANNER SIDE ANIMATIONS --- */}
            
            {/* 1. Top-Right Floating Live Status Badge */}
            <div className="absolute -top-3 right-0 z-20 animate-float-slow hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-panel border border-amber-500/30 shadow-2xl backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <div className="text-[11px] font-mono font-bold text-[var(--text-heading)] uppercase tracking-wider">Available for Projects</div>
                <div className="text-[9px] font-mono text-emerald-500 font-semibold">Q1 / Q2 Global Commissions</div>
              </div>
            </div>

            {/* 2. Top-Left Floating Calligraphy & Craft Badge */}
            <div className="absolute top-16 -left-6 z-20 animate-float-reverse hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl glass-panel border border-[var(--border-color)] shadow-xl backdrop-blur-xl">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] font-display font-bold text-[var(--text-heading)]">Calligraphy &amp; Type</div>
                <div className="text-[9px] font-mono text-[var(--text-subtle)]">Handmade Ink &amp; Digital Fonts</div>
              </div>
            </div>

            {/* 3. Bottom-Left Floating Brand & Craft Badge */}
            <div className="absolute bottom-10 -left-4 z-20 animate-float-delayed hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel border border-amber-500/30 shadow-2xl backdrop-blur-xl">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-sm shadow-md">
                ✦
              </div>
              <div>
                <div className="text-[11px] font-mono font-bold text-amber-500 uppercase tracking-wider">Brand &amp; Packaging</div>
                <div className="text-xs font-serif-italic text-[var(--text-heading)]">Bespoke Identity Systems</div>
              </div>
            </div>

            {/* 4. Bottom-Right Compass & Interaction Widget */}
            <div className="absolute -bottom-2 right-2 z-20 animate-float-slow hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-subtle)] shadow-sm">
              <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
              <span>Drag 3D Logo &middot; Mouse Reactive</span>
            </div>

          </div>

        </div>
      </div>

      {/* Kinetic Infinite Marquee Running Along Banner Bottom */}
      <div className="relative z-20 mt-6">
        <MarqueeBanner />
      </div>

    </section>
  );
}
