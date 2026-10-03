import React, { useState } from 'react';
import { Send, Mail, Phone, Copy, Check, ArrowUp, ExternalLink, Sparkles } from 'lucide-react';

export default function ContactSection({ profile, onOpenAdmin }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Main Project',
    message: ''
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', service: 'Main Project', message: '' });
    }, 4000);
  };

  return (
    <footer id="contact" className="py-24 relative bg-[var(--bg-subtle)] overflow-hidden border-t border-[var(--border-color)] transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10 space-y-16">
        
        {/* Call to action title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pill-bg)] border border-[var(--border-color)] text-amber-500 text-xs font-mono font-medium">
            <Send className="w-3.5 h-3.5" />
            <span>Initiate Collaboration</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-extrabold text-[var(--text-heading)] tracking-tight">
            Let's build an <span className="font-serif-italic font-normal text-amber-600 dark:text-amber-300">enduring</span> brand identity.
          </h2>
          <p className="text-sm md:text-base text-[var(--text-subtle)] font-light">
            Available for select commercial brand design commissions, luxury packaging inquiries, monograph acquisitions, and bespoke typographic consulting.
          </p>
        </div>

        {/* Contact Grid: Direct Info + Message Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-5xl mx-auto">
          
          {/* Left Column: Direct Inquiries & Quick Copy */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Email Copy Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4 shadow-sm">
              <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider">Direct Studio Email</div>
              <div className="text-base sm:text-lg font-semibold text-[var(--text-heading)] break-all">{profile.email}</div>
              <button
                onClick={handleCopyEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--pill-bg)] hover:bg-amber-500 hover:text-black text-[var(--text-heading)] text-xs font-semibold transition-all border border-[var(--border-color)]"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Email Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Studio Email</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Channels */}
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-3 shadow-sm">
              <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider">Official Social Channels</div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: 'Instagram', url: profile.instagram || 'https://instagram.com' },
                  { name: 'LinkedIn', url: profile.linkedin || 'https://linkedin.com' },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--pill-bg)] hover:bg-black/5 dark:hover:bg-white/15 border border-[var(--border-color)] text-xs font-semibold text-[var(--text-heading)] hover:text-amber-500 transition-all"
                  >
                    <span>{s.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl relative">
              
              {formSubmitted ? (
                <div className="py-16 text-center space-y-3 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[var(--text-heading)]">Inquiry Dispatched!</h3>
                  <p className="text-xs text-[var(--text-subtle)] max-w-sm mx-auto">
                    Thank you, {formData.name}. Yashraj will review your brief and respond via {formData.email} within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Johnathan Ray"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Your Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@studio.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[var(--text-subtle)]">Interested Discipline</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="Main Project">Main Project / Brand Identity</option>
                      <option value="Packaging">Luxury Packaging Design</option>
                      <option value="Typography">Custom Typography / Typeface</option>
                      <option value="Calligraphy">Commissioned Calligraphy &amp; Ink Art</option>
                      <option value="Sketches">Concept Sketching &amp; Art Direction</option>
                      <option value="Digital Art">Surreal Digital Art &amp; Posters</option>
                      <option value="Photography">Art-Directed Photography</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-[var(--text-subtle)]">Project Brief / Message</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your vision, timeline, or scope of work..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-98"
                  >
                    Transmit Inquiry &rarr;
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Global Bottom Bar */}
        <div className="pt-12 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-subtle)]">
          <div>
            &copy; {new Date().getFullYear()} Yashraj &middot; All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-500 font-semibold">{profile.designation}</span>
            <span>&middot;</span>
            <button
              onClick={onOpenAdmin}
              className="text-[var(--text-subtle)] hover:text-amber-500 transition-colors"
            >
              Studio CMS (Admin)
            </button>
            <span>&middot;</span>
            <a href="#" className="flex items-center gap-1 hover:text-[var(--text-heading)] transition-colors">
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
