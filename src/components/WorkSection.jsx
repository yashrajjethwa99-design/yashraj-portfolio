import React, { useState } from 'react';
import { Layers, ArrowUpRight, Search, Eye, Sparkles, Filter } from 'lucide-react';

export default function WorkSection({ projects, categories, onSelectProject }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags && project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="works" className="py-24 relative bg-[var(--bg-main)] overflow-hidden transition-colors duration-300">
      
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 -left-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10 space-y-12">
        
        {/* Section Heading & Introduction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pill-bg)] border border-[var(--border-color)] text-amber-500 text-xs font-mono font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Selected Portfolio Works</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Featured Archive &amp; Disciplines.
            </h2>
            <p className="text-sm md:text-base text-[var(--text-subtle)] max-w-xl font-light">
              Explore 7 creative domains ranging from tactile packaging &amp; sacred calligraphy to custom typography and full brand identities.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by tag, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 7-Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count = cat.id === 'all' 
              ? projects.length 
              : projects.filter(p => p.category === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-[var(--pill-bg)] hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-subtle)] hover:text-[var(--text-heading)] border border-[var(--border-color)]'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-black/30 text-black font-bold' : 'bg-black/5 dark:bg-white/10 text-[var(--text-subtle)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid with 3D Tilt Cards */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-2xl border border-[var(--border-color)] space-y-3">
            <Filter className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
            <h3 className="text-lg font-semibold text-[var(--text-heading)]">No projects found</h3>
            <p className="text-xs text-[var(--text-subtle)]">Try changing your search query or selecting another category.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-2 px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group relative cursor-pointer glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-[var(--glass-border)] flex flex-col justify-between"
              >
                {/* Image Container with Hover Scale */}
                <div className="relative aspect-[16/11] w-full overflow-hidden bg-black/20 dark:bg-black/50">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)]/60 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
                      {project.categoryName || project.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-200">
                      {project.year}
                    </span>
                  </div>

                  {/* Multi-Image indicator */}
                  {project.gallery && project.gallery.length > 1 && (
                    <div className="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-slate-200 border border-white/10">
                      📷 {project.gallery.length} Images
                    </div>
                  )}
                </div>

                {/* Card Content Footer */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-[var(--text-subtle)]">
                      Client &middot; <span className="text-[var(--text-heading)] font-medium">{project.client}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--text-heading)] group-hover:text-amber-500 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[var(--text-body)] line-clamp-2 font-light">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags & Action Row */}
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {project.tags && project.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] font-mono text-[var(--text-subtle)] bg-[var(--pill-bg)] border border-[var(--border-color)] px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:translate-x-0.5 transition-transform">
                      <span>View Case</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
