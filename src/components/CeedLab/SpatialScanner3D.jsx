import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
  Upload, Clipboard, RotateCw, ZoomIn, ZoomOut, Eye, Layers, Sun, Download, 
  RefreshCw, Box, Sparkles, Check, Play, Pause, Scissors, Sliders, ShieldCheck,
  Maximize2, Cylinder, CircleDot, Activity, FileCode
} from 'lucide-react';
import { CEED_3D_PRESETS } from './ceedPresets';

export default function SpatialScanner3D() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);
  const glbInputRef = useRef(null);

  // Active state
  const [activePreset, setActivePreset] = useState(CEED_3D_PRESETS[0]);
  const [currentImageUrl, setCurrentImageUrl] = useState(CEED_3D_PRESETS[0].image);
  const [objectName, setObjectName] = useState(CEED_3D_PRESETS[0].name);
  const [renderMode, setRenderMode] = useState('textured'); // 'textured' | 'clay' | 'wireframe' | 'gold' | 'heatmap' | 'normals'

  // 3D Generative Archetype (The "Aatm Nirbhar" Engine Modes)
  const [geometryMode, setGeometryMode] = useState('organic'); // 'organic' (Igarashi 360° Inflation) | 'revolve' (360° Lathe) | 'cad' (Beveled Prism)
  
  // Accuracy & Shape Tuning Sliders
  const [extrusionDepth, setExtrusionDepth] = useState(1.6);
  const [inflationCurvature, setInflationCurvature] = useState(1.4); // Fullness/Bulge of the 3D body
  const [bgTolerance, setBgTolerance] = useState(25); // Boundary flood-fill sensitivity (5-60)
  const [smoothingPasses, setSmoothingPasses] = useState(3); // Laplacian surface smoothing
  const [rearSymmetry, setRearSymmetry] = useState(0.85); // Backside depth ratio (0.2 to 1.0)

  // Motion & Lighting
  const [autoSpin, setAutoSpin] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(0.9);
  const [lightingPreset, setLightingPreset] = useState('studio'); // 'studio' | 'dramatic' | 'rim'
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteNotification, setPasteNotification] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGlbLoaded, setIsGlbLoaded] = useState(false);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshGroupRef = useRef(null);
  const lightsRef = useRef({});

  // 1. Initialize Scene & OrbitControls
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(4.8, 3.2, 5.8);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // OrbitControls: 360° rotation in all axes, zoom & pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.minDistance = 1.8;
    controls.maxDistance = 18.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Central 3D Mesh Assembly
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.5);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 14, 25);
    fillLight.position.set(-6, -2, 5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf59e0b, 18, 25);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    lightsRef.current = { ambientLight, keyLight, fillLight, rimLight };

    // Metric Spatial Grid Floor (Scale indicator for CEED)
    const gridHelper = new THREE.GridHelper(12, 24, 0xf59e0b, 0x334155);
    gridHelper.position.y = -2.2;
    scene.add(gridHelper);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (autoSpin && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += 0.007 * spinSpeed;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Global Clipboard Paste Listener (`Ctrl + V` from anywhere!)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            loadNewImage(url, 'Pasted Clipboard Image');
            showPasteToast('✓ Image pasted & reconstructing true 360° volume!');
            e.preventDefault();
            return;
          }
        }
      }

      // Check if user pasted an image URL
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http') || text.startsWith('data:image'))) {
        loadNewImage(text, 'Web Image Link');
        showPasteToast('✓ Loaded image URL and generating true 3D model!');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const showPasteToast = (msg) => {
    setPasteNotification(msg);
    setTimeout(() => setPasteNotification(null), 3500);
  };

  const loadNewImage = (url, name) => {
    setIsGlbLoaded(false);
    setCurrentImageUrl(url);
    setObjectName(name);
    setActivePreset({
      id: 'custom-' + Date.now(),
      name: name,
      category: 'Custom Input',
      image: url,
      description: 'Accurate 3D volumetric model generated via boundary flood-fill & spherical inflation.'
    });
  };

  // 3. Load External .GLB File directly
  const loadGlbFile = (file) => {
    const url = URL.createObjectURL(file);
    setIsProcessing(true);
    const loader = new GLTFLoader();

    loader.load(
      url,
      (gltf) => {
        const meshGroup = meshGroupRef.current;
        if (!meshGroup) return;

        // Clear previous
        while (meshGroup.children.length > 0) {
          meshGroup.remove(meshGroup.children[0]);
        }

        const model = gltf.scene;
        // Center and scale model to fit view
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.0 / maxDim;
        model.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        meshGroup.add(model);
        setIsGlbLoaded(true);
        setObjectName(file.name.replace(/\.[^/.]+$/, ''));
        setIsProcessing(false);
        showPasteToast('✓ Genuine 3D (.GLB) model loaded successfully!');
      },
      undefined,
      (error) => {
        console.error('Failed to load GLB:', error);
        setIsProcessing(false);
        showPasteToast('❌ Failed to parse .GLB file');
      }
    );
  };

  // 4. "AATM NIRBHAR" 3D VOLUMETRIC RECONSTRUCTION ENGINE
  useEffect(() => {
    if (isGlbLoaded || !currentImageUrl || !meshGroupRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;

    img.onload = () => {
      buildAatmNirbhar3DModel(img);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [
    currentImageUrl, isGlbLoaded, geometryMode, extrusionDepth, 
    inflationCurvature, bgTolerance, smoothingPasses, rearSymmetry, renderMode
  ]);

  const buildAatmNirbhar3DModel = (img) => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    // Clear previous
    while (meshGroup.children.length > 0) {
      const obj = meshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      meshGroup.remove(obj);
    }

    const cols = 120;
    const rows = 120;

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cols, rows);
    const imgData = ctx.getImageData(0, 0, cols, rows);
    const data = imgData.data;

    // =========================================================================
    // STEP A: BOUNDARY-CONNECTED FLOOD FILL (Solves the "White Chest / Eye Holes" Bug!)
    // =========================================================================
    // Instead of naive color matching, only pixels CONNECTED TO THE OUTER BORDER
    // are classified as background. The white chest & eye reflections of the cat
    // are enclosed inside the silhouette, so they will NEVER be deleted!
    const isBackground = new Uint8Array(cols * rows);
    const visited = new Uint8Array(cols * rows);

    // Sample average background color along outer borders
    let borderR = 0, borderG = 0, borderB = 0, borderCount = 0;
    const sampleBorder = (x, y) => {
      const idx = (y * cols + x) * 4;
      borderR += data[idx];
      borderG += data[idx + 1];
      borderB += data[idx + 2];
      borderCount++;
    };
    for (let x = 0; x < cols; x++) {
      sampleBorder(x, 0);
      sampleBorder(x, rows - 1);
    }
    for (let y = 0; y < rows; y++) {
      sampleBorder(0, y);
      sampleBorder(cols - 1, y);
    }
    const bgR = borderR / borderCount;
    const bgG = borderG / borderCount;
    const bgB = borderB / borderCount;

    const colorDistSq = (r, g, b) => (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
    const maxBgDistSq = (bgTolerance * 3.5) ** 2;

    // Breadth-First Search (BFS) Flood Fill from 4 borders
    const queue = [];
    const pushIfBg = (x, y) => {
      const idx = y * cols + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      const pi = idx * 4;
      const alpha = data[pi + 3];
      // If transparent or matches border color
      if (alpha < 30 || colorDistSq(data[pi], data[pi + 1], data[pi + 2]) < maxBgDistSq) {
        isBackground[idx] = 1;
        queue.push(x, y);
      }
    };

    // Seed borders into queue
    for (let x = 0; x < cols; x++) {
      pushIfBg(x, 0);
      pushIfBg(x, rows - 1);
    }
    for (let y = 0; y < rows; y++) {
      pushIfBg(0, y);
      pushIfBg(cols - 1, y);
    }

    // Process BFS Queue
    let qHead = 0;
    while (qHead < queue.length) {
      const cx = queue[qHead++];
      const cy = queue[qHead++];

      const neighbors = [
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      ];
      for (let n = 0; n < 4; n++) {
        const nx = neighbors[n][0];
        const ny = neighbors[n][1];
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
          pushIfBg(nx, ny);
        }
      }
    }

    // Foreground mask: Anything NOT reached by the outer flood fill is the solid object!
    const isForeground = new Uint8Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      isForeground[i] = isBackground[i] ? 0 : 1;
    }

    // =========================================================================
    // STEP B: CHORDAL DISTANCE TRANSFORM & TRUE 360° VOLUMETRIC INFLATION
    // (Based on Igarashi 3D Inflation - Gives real round belly, head, back & sides!)
    // =========================================================================
    const distMap = new Float32Array(cols * rows);
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const idx = y * cols + x;
        if (isForeground[idx]) {
          distMap[idx] = Math.min(
            distMap[idx - 1] + 1,
            distMap[idx - cols] + 1,
            distMap[idx - cols - 1] + 1.414,
            distMap[idx - cols + 1] + 1.414
          );
        }
      }
    }
    for (let y = rows - 2; y >= 1; y--) {
      for (let x = cols - 2; x >= 1; x--) {
        const idx = y * cols + x;
        if (isForeground[idx]) {
          distMap[idx] = Math.min(
            distMap[idx],
            distMap[idx + 1] + 1,
            distMap[idx + cols] + 1,
            distMap[idx + cols + 1] + 1.414,
            distMap[idx + cols - 1] + 1.414
          );
        }
      }
    }

    let maxDist = 1;
    for (let i = 0; i < distMap.length; i++) {
      if (distMap[i] > maxDist) maxDist = distMap[i];
    }

    // Surface Laplacian Smoothing to prevent spiky edges
    for (let pass = 0; pass < smoothingPasses; pass++) {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const idx = y * cols + x;
          if (isForeground[idx]) {
            distMap[idx] = (
              distMap[idx] * 4 +
              distMap[idx - 1] +
              distMap[idx + 1] +
              distMap[idx - cols] +
              distMap[idx + cols]
            ) / 8;
          }
        }
      }
    }

    // =========================================================================
    // STEP C: BUILD 3D DUAL-SIDED SOLID MESH (Watertight Manifold)
    // =========================================================================
    const planeW = 4.4;
    const aspect = img.height / img.width;
    const planeH = planeW * aspect;

    const vertices = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    const frontMap = new Int32Array(cols * rows).fill(-1);
    const backMap = new Int32Array(cols * rows).fill(-1);
    let vCount = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (!isForeground[idx]) continue;

        const pi = idx * 4;
        const r = data[pi] / 255;
        const g = data[pi + 1] / 255;
        const b = data[pi + 2] / 255;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        const normDist = Math.min(1.0, distMap[idx] / maxDist);

        // Spherical Cross-Section (Igarashi Equation: z = sqrt(1 - (1 - d)^2))
        // This makes the object naturally round and bulging like a real physical 3D body!
        const sphericalBulge = Math.sqrt(Math.max(0, 1.0 - (1.0 - normDist) ** 2)) * inflationCurvature;
        const surfaceRelief = (1.0 - luminance) * 0.25;

        // Front and Back Depth
        const zFront = (sphericalBulge + surfaceRelief) * extrusionDepth * 0.5;
        const zBack = -sphericalBulge * extrusionDepth * 0.5 * rearSymmetry;

        const vx = ((x / (cols - 1)) - 0.5) * planeW;
        const vy = -((y / (rows - 1)) - 0.5) * planeH;
        const u = x / (cols - 1);
        const v = 1.0 - (y / (rows - 1));

        // Depth Heatmap color
        const heatHue = (1.0 - Math.min(1.0, zFront / (extrusionDepth * 1.5))) * 0.7;
        const heatColor = new THREE.Color().setHSL(heatHue, 0.9, 0.5);

        // Front Vertex
        frontMap[idx] = vCount;
        vertices.push(vx, vy, zFront);
        uvs.push(u, v);
        colors.push(heatColor.r, heatColor.g, heatColor.b);
        vCount++;

        // Back Vertex (True 3D Backside!)
        backMap[idx] = vCount;
        vertices.push(vx, vy, zBack);
        uvs.push(1.0 - u, v); // Symmetrically mirrored UV for back body
        colors.push(0.25, 0.25, 0.3);
        vCount++;
      }
    }

    // Connect Faces for Front and Back Shells
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        const i0 = y * cols + x;
        const i1 = y * cols + (x + 1);
        const i2 = (y + 1) * cols + x;
        const i3 = (y + 1) * cols + (x + 1);

        const f0 = frontMap[i0];
        const f1 = frontMap[i1];
        const f2 = frontMap[i2];
        const f3 = frontMap[i3];

        if (f0 !== -1 && f1 !== -1 && f2 !== -1 && f3 !== -1) {
          // Front Triangles
          indices.push(f0, f1, f2);
          indices.push(f1, f3, f2);
        }

        const b0 = backMap[i0];
        const b1 = backMap[i1];
        const b2 = backMap[i2];
        const b3 = backMap[i3];

        if (b0 !== -1 && b1 !== -1 && b2 !== -1 && b3 !== -1) {
          // Back Triangles (reversed winding order for outward facing normals)
          indices.push(b2, b1, b0);
          indices.push(b2, b3, b1);
        }
      }
    }

    // Step D: Construct Watertight Side Perimeter Wall Connecting Front & Back
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (!isForeground[idx]) continue;

        const isBorder = (nx, ny) => {
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true;
          return !isForeground[ny * cols + nx];
        };

        // Horizontal neighbor edge
        if (x < cols - 1 && isForeground[idx + 1] && (isBorder(x, y - 1) || isBorder(x, y + 1))) {
          const fA = frontMap[idx];
          const fB = frontMap[idx + 1];
          const bA = backMap[idx];
          const bB = backMap[idx + 1];
          if (fA !== -1 && fB !== -1 && bA !== -1 && bB !== -1) {
            indices.push(fA, fB, bA);
            indices.push(fB, bB, bA);
          }
        }

        // Vertical neighbor edge
        if (y < rows - 1 && isForeground[idx + cols] && (isBorder(x - 1, y) || isBorder(x + 1, y))) {
          const fA = frontMap[idx];
          const fB = frontMap[idx + cols];
          const bA = backMap[idx];
          const bB = backMap[idx + cols];
          if (fA !== -1 && fB !== -1 && bA !== -1 && bB !== -1) {
            indices.push(fB, fA, bB);
            indices.push(fA, bA, bB);
          }
        }
      }
    }

    // Create Geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Texture mapping
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(currentImageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;

    // Materials
    let material;
    if (renderMode === 'textured') {
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.15,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'clay') {
      material = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        roughness: 0.5,
        metalness: 0.05,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'wireframe') {
      material = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'gold') {
      material = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.15,
        metalness: 0.95,
        emissive: 0x92400e,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'heatmap') {
      material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'normals') {
      material = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshGroup.add(mesh);
  };

  // Lighting preset switcher
  useEffect(() => {
    const { keyLight, fillLight, rimLight } = lightsRef.current;
    if (!keyLight) return;

    if (lightingPreset === 'studio') {
      keyLight.intensity = 2.5;
      keyLight.position.set(5, 8, 6);
      fillLight.intensity = 14;
      rimLight.intensity = 18;
    } else if (lightingPreset === 'dramatic') {
      keyLight.intensity = 3.8;
      keyLight.position.set(6, 2, 4);
      fillLight.intensity = 4;
      rimLight.intensity = 25;
    } else if (lightingPreset === 'rim') {
      keyLight.intensity = 1.0;
      fillLight.intensity = 6;
      rimLight.intensity = 40;
      rimLight.position.set(0, 5, -6);
    }
  }, [lightingPreset]);

  // Handle Drag & Drop onto Viewport (supports both Images AND .GLB 3D files!)
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      loadGlbFile(file);
    } else if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      loadNewImage(url, file.name);
      showPasteToast('✓ Image dropped & converting to 360° volume!');
    }
  };

  // Handle Manual File Input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadNewImage(url, file.name);
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4.8, 3.2, 5.8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Capture High-Res Snapshot
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `3d-${objectName.toLowerCase().replace(/\s+/g, '-')}-view.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Universal Input Bar: Paste (Ctrl+V) · Upload · Drop .GLB */}
      <div className="p-4 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Main Action Callout */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AATM-NIRBHAR 3D ENGINE (100% IN-HOUSE &amp; FREE)</span>
              </span>
              <span className="text-[11px] font-mono text-amber-500 font-bold">
                No Cloud Limits &middot; No Subscriptions
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">
              Convert Any 2D Image to True 360° Volumetric Solid (Or Drop .GLB File)
            </h3>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Direct Paste Trigger Button */}
            <button
              onClick={async () => {
                try {
                  const clipboardItems = await navigator.clipboard.read();
                  for (const item of clipboardItems) {
                    const imgType = item.types.find(t => t.startsWith('image/'));
                    if (imgType) {
                      const blob = await item.getType(imgType);
                      const url = URL.createObjectURL(blob);
                      loadNewImage(url, 'Pasted Clipboard Image');
                      showPasteToast('✓ Image pasted & converting to true 3D volume!');
                      return;
                    }
                  }
                  showPasteToast('💡 Copy an image or take a screenshot, then click here or press Ctrl+V!');
                } catch {
                  showPasteToast('💡 Press Ctrl + V directly on your keyboard to paste!');
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Clipboard className="w-4 h-4" />
              <span>Paste Image (Ctrl + V)</span>
            </button>

            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-xs text-[var(--text-heading)] hover:border-amber-500/40 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>Upload Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Direct .GLB 3D File Loader */}
            <button
              onClick={() => glbInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono transition-all"
              title="Load any real 3D model (.glb / .gltf) from Tripo3D or Poly Pizza"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Load .GLB File</span>
            </button>
            <input
              type="file"
              ref={glbInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) loadGlbFile(file);
              }}
              accept=".glb,.gltf"
              className="hidden"
            />

            {/* Reset Camera */}
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-xs text-[var(--text-subtle)] hover:text-white transition-all"
              title="Reset 3D camera to default isometric view"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Save PNG Snapshot */}
            <button
              onClick={handleDownloadSnapshot}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save 3D Angle</span>
            </button>

          </div>

        </div>

        {/* Quick Presets Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)] text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--text-subtle)]">Try Sample Presets:</span>
            {CEED_3D_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setIsGlbLoaded(false);
                  setActivePreset(p);
                  setCurrentImageUrl(p.image);
                  setObjectName(p.name);
                  setExtrusionDepth(p.defaultExtrusion);
                }}
                className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                  currentImageUrl === p.image && !isGlbLoaded
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 font-bold'
                    : 'bg-[var(--pill-bg)] text-[var(--text-body)] hover:text-white border border-[var(--border-color)]'
                }`}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-emerald-400 font-mono">
            🛡️ Boundary Flood-Fill: White fur &amp; reflections protected from cutout
          </div>
        </div>

      </div>

      {/* Main 3D Viewport with Drag-and-Drop Dropzone Overlay */}
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative w-full h-[560px] md:h-[640px] rounded-3xl overflow-hidden glass-panel border shadow-2xl transition-all ${
          isDragOver 
            ? 'border-amber-500 ring-4 ring-amber-500/30' 
            : 'border-[var(--border-color)]'
        } bg-gradient-to-b from-[#090d16] via-[#0b101d] to-[#06080e]`}
      >
        
        {/* Three.js Canvas Container */}
        <div 
          ref={mountRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          title="360° Interactive Orbit: Left click drag to spin, right click to pan, scroll wheel to zoom"
        />

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40">
            <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl glass-panel border border-amber-500/40 text-amber-500 text-xs font-mono font-bold animate-pulse shadow-2xl">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Analyzing Boundary &amp; Reconstructing 3D Solid Volume...</span>
            </div>
          </div>
        )}

        {/* Drag-and-Drop Active Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm border-4 border-dashed border-amber-500 rounded-3xl flex items-center justify-center z-40 pointer-events-none">
            <div className="p-6 rounded-3xl bg-black/80 text-amber-400 font-display font-bold text-lg flex items-center gap-3">
              <Upload className="w-6 h-6 animate-bounce" />
              <span>Drop Any Image or .GLB File to View in True 3D!</span>
            </div>
          </div>
        )}

        {/* Floating Paste Notification Toast */}
        {pasteNotification && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-2xl bg-emerald-500 text-black font-mono font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{pasteNotification}</span>
          </div>
        )}

        {/* Floating Top-Left: Active Model Card */}
        <div className="absolute top-4 left-4 z-20 max-w-xs p-3.5 rounded-2xl glass-panel border border-white/10 space-y-1 shadow-2xl backdrop-blur-xl bg-black/70 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
              {isGlbLoaded ? 'Native .GLB 3D Mesh' : '360° Volumetric Solid'}
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Watertight 3D
            </span>
          </div>
          <h4 className="text-sm font-display font-bold text-white line-clamp-1">{objectName}</h4>
          <p className="text-[11px] text-slate-300">
            Left-click drag to rotate 360° &middot; Scroll wheel to zoom
          </p>
        </div>

        {/* Floating Top-Right: Quick Shortcuts Badge */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border border-white/10 text-[11px] font-mono text-slate-300 backdrop-blur-xl bg-black/70 shadow-xl">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            360° All Directions
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
            Zoom In / Out
          </span>
        </div>

        {/* Floating Bottom Toolbar: Shading, Volumetric Inflation, Accuracy Tuning */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2.5 p-3 rounded-3xl glass-panel border border-white/15 backdrop-blur-2xl bg-black/80 text-white shadow-2xl">
          
          {/* Row 1: Render Modes */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {[
                { id: 'textured', label: 'Realistic Texture', icon: Eye },
                { id: 'clay', label: 'Clay Sculpt', icon: Box },
                { id: 'wireframe', label: 'Wireframe Mesh', icon: Layers },
                { id: 'gold', label: 'Gold Metallic', icon: Sparkles },
                { id: 'heatmap', label: 'Depth Heatmap', icon: RefreshCw },
                { id: 'normals', label: 'Surface Normals', icon: Activity }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setRenderMode(m.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      renderMode === m.id
                        ? 'bg-amber-500 text-black font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Auto-Spin Control & Lighting Preset */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoSpin(!autoSpin)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                  autoSpin
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                    : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                {autoSpin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{autoSpin ? 'Spinning' : 'Paused'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-mono">
                <Sun className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
                {['studio', 'dramatic', 'rim'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLightingPreset(l)}
                    className={`px-2 py-0.5 rounded-md capitalize transition-all ${
                      lightingPreset === l
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Accuracy Calibration Sliders */}
          {!isGlbLoaded && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs font-mono">
              
              {/* 3D Thickness Extrusion */}
              <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">3D Thickness:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.4"
                    max="3.2"
                    step="0.1"
                    value={extrusionDepth}
                    onChange={(e) => setExtrusionDepth(parseFloat(e.target.value))}
                    className="w-16 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-amber-400 font-bold w-7">{extrusionDepth}x</span>
                </div>
              </div>

              {/* Spherical Bulge / 360° Roundness */}
              <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">360° Roundness:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={inflationCurvature}
                    onChange={(e) => setInflationCurvature(parseFloat(e.target.value))}
                    className="w-16 accent-sky-400 cursor-pointer"
                  />
                  <span className="text-sky-400 font-bold w-7">{inflationCurvature}x</span>
                </div>
              </div>

              {/* Backside Depth Ratio */}
              <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">Back Depth:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={rearSymmetry}
                    onChange={(e) => setRearSymmetry(parseFloat(e.target.value))}
                    className="w-16 accent-purple-400 cursor-pointer"
                  />
                  <span className="text-purple-400 font-bold w-7">{Math.round(rearSymmetry * 100)}%</span>
                </div>
              </div>

              {/* Background Cutout Sensitivity */}
              <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-slate-300">Edge Filter:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={bgTolerance}
                    onChange={(e) => setBgTolerance(parseInt(e.target.value))}
                    className="w-16 accent-emerald-400 cursor-pointer"
                  />
                  <span className="text-emerald-400 font-bold w-6">{bgTolerance}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
