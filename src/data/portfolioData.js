export const INITIAL_PORTFOLIO_DATA = {
  profile: {
    name: "Yashraj",
    designation: "Graphic Designer",
    tagline: "Multidisciplinary Visual Artist & Brand Specialist",
    location: "India · Working Globally",
    heroHeadline: "Crafting Identity, Tactile Packaging & Expressive Typography.",
    heroSubheadline: "Blending traditional calligraphy with cutting-edge digital branding, structural packaging systems, and custom typography.",
    bio: "I am a Graphic Designer and Visual Artist rooted in the disciplines of broad-edge calligraphy, typographic precision, and structural packaging. With over 6+ years of dedicated practice spanning corporate visual identities, luxury packaging design, and brand storytelling, my work bridges the timeless tactile beauty of ink-on-paper with contemporary digital design standards.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    email: "yashraj.design@gmail.com",
    phone: "+91 98765 43210",
    behance: "https://www.behance.net/gallery/244803829/PORTFOLIO-2026-GRAPHIC-DESIGNER-ILLUSTRATOR",
    dribbble: "https://dribbble.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    resumeUrl: "#",
    skills: {
      digital: ["Adobe Illustrator", "Adobe Photoshop", "InDesign", "Blender (3D)", "Figma", "After Effects", "Lightroom"],
      analog: ["Broad-Edge Calligraphy", "Brush Lettering", "Pencil & Charcoal Sketching", "Printmaking & Linocut", "Paper Engineering", "Visual Composition"]
    },
    experienceTimeline: [
      { year: "2025–Present", title: "Principal Brand Identity Designer", org: "Yashraj Studio · Independent Commissions" },
      { year: "2023–2025", title: "Senior Packaging & Visual Designer", org: "Vanguard Creative Agency" },
      { year: "2021–2023", title: "Visual Artist & Typographer", org: "Studio Heritage & Print Atelier" },
      { year: "2019–2021", title: "Junior Graphic Designer", org: "Atelier Form & Ink" }
    ]
  },

  categories: [
    { id: "all", name: "All Works" },
    { id: "main", name: "Main Project" },
    { id: "packaging", name: "Packaging" },
    { id: "typography", name: "Typography" },
    { id: "calligraphy", name: "Calligraphy" },
    { id: "sketches", name: "Sketches" },
    { id: "digital_art", name: "Digital Art" },
    { id: "photography", name: "Photography" }
  ],

  projects: [
    {
      id: "proj-1",
      title: "Royal Heritage Brand Identity & Stationery",
      category: "main",
      categoryName: "Main Project",
      year: "2026",
      client: "Maharaja Heritage Trust",
      coverImage: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "A comprehensive corporate visual identity system created for a royal architectural preservation trust. The project involved custom serif logotypes, gold foil stamped letterheads, wax seal insignias, and brand guidelines across print and digital touchpoints.",
      tags: ["Brand Identity", "Gold Foil", "Stationery", "Logo System"],
      colors: ["#1e293b", "#d97706", "#fef3c7", "#475569"],
      featured: true
    },
    {
      id: "proj-2",
      title: "Soma Botanical Ayurvedic Bottle & Outer Box Packaging",
      category: "packaging",
      categoryName: "Packaging",
      year: "2025",
      client: "Soma Wellness Co.",
      coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1527632984437-11444971c26b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "Structural die-cut packaging for luxury botanical hair oil and face serums. Crafted with 100% recyclable textured cotton paper, tactile blind embossing, and hand-drawn botanical illustrations that celebrate ancient Himalayan flora.",
      tags: ["Structural Packaging", "Die-Cut Box", "Glass Bottle Mockup", "Sustainable"],
      colors: ["#064e3b", "#ecfdf5", "#92400e", "#18181b"],
      featured: true
    },
    {
      id: "proj-3",
      title: "Yashraj Display: Experimental Ligature Typeface",
      category: "typography",
      categoryName: "Typography",
      year: "2025",
      client: "Type Foundry Project",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "A high-contrast display serif typeface engineered with 120+ interlocking ligatures. Designed specifically for editorial luxury mastheads, fragrance packaging, and book covers, drawing inspiration from early 20th-century European stone engravings.",
      tags: ["Font Design", "Type Specimen", "Ligatures", "Editorial"],
      colors: ["#09090b", "#fafafa", "#b45309", "#71717a"],
      featured: true
    },
    {
      id: "proj-4",
      title: "Fluid Ink & Devanagari Calligraphy Expressions",
      category: "calligraphy",
      categoryName: "Calligraphy",
      year: "2024",
      client: "Artisan Gallery Exhibition",
      coverImage: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "A continuous series of handcrafted calligraphy manuscripts executed with Japanese sumi ink and hand-carved bamboo pens. Combining classical Devanagari aksharas with gestural abstraction to express energy, breath, and spatial harmony.",
      tags: ["Sumi Ink", "Bamboo Pen", "Devanagari", "Handcrafted Art"],
      colors: ["#18181b", "#f5f5f4", "#991b1b", "#57534e"],
      featured: true
    },
    {
      id: "proj-5",
      title: "Monuments in Charcoal: Architectural Sketch Studies",
      category: "sketches",
      categoryName: "Sketches",
      year: "2024",
      client: "Personal Exploration",
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "Quick observational perspective sketches done on location across stepwells and stone temples in Gujarat. Explores light, rhythm, negative space, and tonal depth using raw vine charcoal, graphite, and sepia washes.",
      tags: ["Live Sketching", "Charcoal", "Architectural Study", "Texture"],
      colors: ["#292524", "#d6d3d1", "#78716c", "#1c1917"],
      featured: false
    },
    {
      id: "proj-6",
      title: "The Celestial Weaver: Surreal Vector Illustration",
      category: "digital_art",
      categoryName: "Digital Art",
      year: "2025",
      client: "Editorial Magazine Commission",
      coverImage: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "A high-detail isometric and surreal vector artwork depicting an allegorical artisan weaving constellations out of silk threads. Exhibited as a limited-edition risograph art print series.",
      tags: ["Vector Art", "Surrealism", "Risograph", "Digital Illustration"],
      colors: ["#1e1b4b", "#f43f5e", "#38bdf8", "#fbbf24"],
      featured: false
    },
    {
      id: "proj-7",
      title: "Tones of Solitude: High-Contrast Monographic Photography",
      category: "photography",
      categoryName: "Photography",
      year: "2025",
      client: "Visual Diary",
      coverImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000",
      gallery: [
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000"
      ],
      description: "Art-directed 35mm film photography exploring the interplay of razor-sharp midday shadows and weathered concrete textures. Demonstrates strict visual framing, negative space mastery, and atmospheric lighting.",
      tags: ["35mm Film", "Monochrome", "Light & Shadow", "Art Direction"],
      colors: ["#000000", "#ffffff", "#52525b", "#a1a1aa"],
      featured: false
    }
  ]
};
