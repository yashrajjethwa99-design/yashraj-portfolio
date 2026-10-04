// Preloaded CEED Practice Models, Prompts, and Spatial Data
export const CEED_3D_PRESETS = [
  {
    id: 'kettle',
    name: 'Industrial Electric Kettle',
    category: 'Product Design',
    image: '/ceed/kettle.jpg',
    description: 'Clean cylindrical body with wooden ergonomic cantilever handle and chamfered spout.',
    spatialDifficulty: 'Medium',
    defaultExtrusion: 1.4,
    tags: ['Industrial Design', 'Curved Surface', 'Ergonomics']
  },
  {
    id: 'polyhedron',
    name: 'Stepped Truncated Polyhedron',
    category: 'Spatial Reasoning',
    image: '/ceed/polyhedron.jpg',
    description: 'Complex faceted solid with carved stepped stairs and diagonal 45° chamfers. Classic CEED Part A test geometry.',
    spatialDifficulty: 'Hard',
    defaultExtrusion: 1.8,
    tags: ['Part A Spatial Test', 'Cross-Sections', 'Surface Counting']
  },
  {
    id: 'chair',
    name: 'Ergonomic Lounge Recliner',
    category: 'Furniture & Ergonomics',
    image: '/ceed/chair.jpg',
    description: 'Two-point perspective concept chair with lumbar support, flex-link joints, and aluminum star base.',
    spatialDifficulty: 'Medium-High',
    defaultExtrusion: 1.2,
    tags: ['Part B Sketching', 'Anthropometry', '2-Point Perspective']
  },
  {
    id: 'ortho-gearbox',
    name: 'Precision Machinery Housing',
    category: 'Orthographic Drafting',
    image: '/ceed/orthographic.jpg',
    description: 'Multi-view technical casing with bore holes, concentric flanges, and hidden internal cavities.',
    spatialDifficulty: 'Advanced',
    defaultExtrusion: 1.5,
    tags: ['Engineering Drawing', 'Section Planes', 'Multi-View']
  }
];

export const CEED_SKETCH_PROMPTS = [
  {
    title: 'Portable Fruit Harvester',
    brief: 'Design a handheld fruit picking tool for mango/apple orchards in India. Must have a soft silicone grabber, mechanical trigger, and telescopic carbon-fiber pole.',
    category: 'Agriculture & Tools',
    style: 'marker',
    sampleImage: '/ceed/kettle.jpg',
    keyFeatures: ['Ergonomic Grip', 'Cutter Mechanism', 'Telescopic Pole', 'Lightweight (<1.2kg)']
  },
  {
    title: 'Ergonomic Public Transport Seat',
    brief: 'Design a modular metro/bus passenger seat with integrated luggage tuck space, umbrella holder, and antibacterial molded surfaces.',
    category: 'Public Transport & Mobility',
    style: 'construction',
    sampleImage: '/ceed/chair.jpg',
    keyFeatures: ['Luggage Under-bay', 'Cantilever Armrest', 'Anti-slip Texture', 'Anthropometric 95th Percentile']
  },
  {
    title: 'Hybrid Terra-Cotta Water Cooler',
    brief: 'Modern water dispenser inspired by traditional Indian matka (earthen pot), blending evaporative natural cooling with a digital purity sensor.',
    category: 'Sustainable Living',
    style: 'ink',
    sampleImage: '/ceed/kettle.jpg',
    keyFeatures: ['Porous Clay Outer Shell', 'Brass Spigot Valve', 'Digital TDS Indicator', 'Bespoke Wooden Stand']
  },
  {
    title: 'Emergency Staircase Stretcher',
    brief: 'A lightweight collapsible emergency rescue device that effortlessly converts between a flat stretcher and a wheeled stair-descending chair for narrow Indian apartment staircases.',
    category: 'Emergency & Medical',
    style: 'clay',
    sampleImage: '/ceed/polyhedron.jpg',
    keyFeatures: ['Tri-wheel Stair Climber', 'Quick-release Latch', 'Foldable Footrest', 'High-visibility Reflectors']
  }
];

export const CEED_EXAM_TIPS = [
  {
    category: 'Part A: Spatial Visualization',
    tips: [
      'Top View (Plan) always aligns vertically with Front View (Elevation) in First Angle Projection.',
      'Count hidden surfaces by projecting lines into planes — dashed lines signify occluded internal edges.',
      'For folded cubes and polyhedra, identify unique anchor faces (e.g., L-cuts or asymmetric notches) before mentally unfolding.',
      'In isometric drawings, circles always project as ellipses whose major axis is perpendicular to the isometric axis.'
    ]
  },
  {
    category: 'Part B: Design & Sketching',
    tips: [
      'Always lay down light 2-point perspective construction lines (vanishing points off the page) before committing dark marker outlines.',
      'Show human scale: include a hand interacting with a button, grip, or trigger to prove ergonomics.',
      'Use 3 line weights: thin for construction guides, medium for inner contours, and bold heavy line for outer silhouette silhouette.',
      'Write clear 2-word annotation callouts with leader lines (e.g. "Molded Plywood Shell", "Soft-Touch Grip").'
    ]
  }
];
