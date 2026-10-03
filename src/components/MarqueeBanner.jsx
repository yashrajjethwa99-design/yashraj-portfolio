import React from 'react';

export default function MarqueeBanner({ reverse = false, items }) {
  const defaultItems = [
    'BRAND IDENTITY',
    'STRUCTURAL PACKAGING',
    'SACRED CALLIGRAPHY',
    'CUSTOM TYPOGRAPHY',
    '2026 PUBLISHED AUTHOR',
    'CONCEPT SKETCHING',
    'DIGITAL VECTOR ART',
    'EDITORIAL DESIGN'
  ];

  const displayList = items || defaultItems;

  return (
    <div className="relative w-full py-4 overflow-hidden border-y border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-md select-none">
      
      {/* Edge Blur Masking */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--bg-main)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--bg-main)] to-transparent z-10 pointer-events-none" />

      {/* Infinite Scrolling Track */}
      <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}>
        {[...displayList, ...displayList, ...displayList, ...displayList].map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 px-4">
            <span className="font-display font-bold text-sm md:text-base tracking-widest text-[var(--text-heading)] hover:text-amber-500 transition-colors cursor-default whitespace-nowrap">
              {item}
            </span>
            <span className="text-amber-500 font-serif text-lg opacity-70">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
