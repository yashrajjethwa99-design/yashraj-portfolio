import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, ArrowUpRight, Lock, Layers, User, Send, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onOpenAdmin, activeSection }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Works', href: '#works', icon: Layers },
    { name: 'About Craft', href: '#about', icon: User },
    { name: 'Contact', href: '#contact', icon: Send },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-[var(--bg-nav)] backdrop-blur-xl border-b border-[var(--border-color)] shadow-lg' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <a href="#" className="group flex items-center gap-3">
          <div className="h-10 px-2.5 rounded-xl bg-slate-900/70 dark:bg-black/70 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:border-amber-500/60 group-hover:scale-105 transition-all">
            <img src="/yashraj_logo.png" alt="Yashraj" className="h-7 w-auto object-contain drop-shadow" />
          </div>
          <div>
            <div className="font-display font-bold text-base md:text-lg text-[var(--text-heading)] group-hover:text-amber-500 transition-colors">
              Yashraj
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tag uppercase tracking-wider text-amber-500 font-semibold">
                Graphic Designer
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-4 py-1.5 rounded-full border border-[var(--glass-border)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-amber-500" />
                <span>{link.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Right CTA, Theme Toggle & Admin Button */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* THEME TOGGLE BUTTON (Light / Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] hover:border-amber-500/40 text-xs font-mono transition-all text-[var(--text-heading)] shadow-sm"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="text-[11px] font-medium text-amber-400">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="text-[11px] font-medium text-slate-700">Dark Mode</span>
              </>
            )}
          </button>

          {/* Non-Tech Studio CMS Button */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-mono text-[var(--text-subtle)] hover:text-amber-500 hover:border-amber-500/40 bg-[var(--pill-bg)] transition-all"
            title="Open Non-Tech Studio CMS to Add/Edit Works"
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Studio CMS</span>
          </button>

          {/* Let's Talk CTA */}
          <a
            href="#contact"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-heading)]"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile CMS */}
          <button
            onClick={onOpenAdmin}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--pill-bg)] text-amber-500 text-xs"
            title="Studio CMS"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-heading)]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-b border-[var(--border-color)] mt-3 px-6 py-6 space-y-4 bg-[var(--bg-main)]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-medium text-[var(--text-body)] hover:text-amber-500 py-2 border-b border-[var(--border-color)]"
              >
                <Icon className="w-4 h-4 text-amber-500" />
                <span>{link.name}</span>
              </a>
            );
          })}
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-xs font-mono text-[var(--text-heading)]"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 text-xs font-mono"
            >
              <Lock className="w-4 h-4" />
              <span>Open Studio CMS (Admin Panel)</span>
            </button>

            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-xs"
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
