import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Calendar, User, Tag, Palette, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectModal({ project, onClose }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && project.gallery) {
        setActiveImageIndex((prev) => (prev + 1) % project.gallery.length);
      }
      if (e.key === 'ArrowLeft' && project.gallery) {
        setActiveImageIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [project, onClose]);

  if (!project) return null;

  const galleryImages = project.gallery && project.gallery.length > 0 ? project.gallery : [project.coverImage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-xl animate-fadeIn">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Window */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-y-auto glass-panel border border-[var(--border-color)] rounded-2xl md:rounded-3xl shadow-2xl bg-[var(--modal-bg)] text-[var(--text-body)]">
        
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[var(--modal-bg)]/90 backdrop-blur-md border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {project.categoryName || project.category}
            </span>
            <span className="text-xs font-mono text-[var(--text-subtle)]">
              {project.year} &middot; {project.client}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/15 border border-[var(--border-color)] text-[var(--text-subtle)] hover:text-[var(--text-heading)] transition-all"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* Main Visual Carousel / Viewer */}
          <div className="space-y-4">
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-black/40 border border-[var(--border-color)] group">
              <img
                src={galleryImages[activeImageIndex]}
                alt={project.title}
                className="w-full h-full object-contain md:object-cover transition-all duration-300"
              />

              {/* Prev / Next Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white transition-all opacity-80 hover:opacity-100"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 text-white transition-all opacity-80 hover:opacity-100"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-black/75 backdrop-blur-md text-xs font-mono text-amber-400 border border-white/10">
                {activeImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      idx === activeImageIndex 
                        ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20' 
                        : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-[var(--border-color)]">
            
            {/* Left 2 Cols: Description & Design Narrative */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-heading)] leading-tight">
                {project.title}
              </h2>
              <div className="text-[var(--text-body)] text-sm md:text-base leading-relaxed font-light space-y-3">
                <p>{project.description}</p>
              </div>

              {/* Tags */}
              {project.tags && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-subtle)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Metadata Sidebar */}
            <div className="space-y-6 lg:border-l lg:border-[var(--border-color)] lg:pl-8">
              
              {/* Client & Role */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider">Client / Commission</div>
                  <div className="text-sm font-semibold text-[var(--text-heading)] mt-0.5">{project.client}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider">Discipline</div>
                  <div className="text-sm font-semibold text-amber-500 mt-0.5">{project.categoryName || project.category}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider">Year of Execution</div>
                  <div className="text-sm font-semibold text-[var(--text-heading)] mt-0.5">{project.year}</div>
                </div>
              </div>

              {/* Color Palette Palette Swatches */}
              {project.colors && project.colors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                  <div className="text-xs font-mono text-[var(--text-subtle)] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    <span>Curated Color Palette</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {project.colors.map((hex, i) => (
                      <div key={i} className="group relative">
                        <div 
                          className="w-8 h-8 rounded-lg border border-[var(--border-color)] shadow-md cursor-pointer hover:scale-110 transition-transform" 
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[var(--text-heading)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[var(--modal-bg)] border border-[var(--border-color)] px-1 rounded shadow-sm">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inquire CTA */}
              <div className="pt-4 border-t border-[var(--border-color)]">
                <a
                  href="#contact"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <span>Inquire for Similar Project</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
