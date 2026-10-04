import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Upload, Clipboard, RotateCw, ZoomIn, ZoomOut, Eye, Layers, Sun, Download, 
  RefreshCw, Box, Sparkles, Check, Play, Pause, Scissors, Sliders, ShieldCheck,
  Maximize2, Image as ImageIcon
} from 'lucide-react';
import { CEED_3D_PRESETS } from './ceedPresets';

export default function SpatialScanner3D() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active state
  const [activePreset, setActivePreset] = useState(CEED_3D_PRESETS[0]);
  const [currentImageUrl, setCurrentImageUrl] = useState(CEED_3D_PRESETS[0].image);
  const [objectName, setObjectName] = useState(CEED_3D_PRESETS[0].name);
  const [renderMode, setRenderMode] = useState('textured'); // 'textured' | 'clay' | 'wireframe' | 'gold' | 'heatmap' | 'points'
  
  // Accuracy & Shape Tuning Sliders
  const [extrusionDepth, setExtrusionDepth] = useState(1.4);
  const [bulgeFactor, setBulgeFactor] = useState(1.2); // Organic curvature / 3D fullness
  const [bgThreshold, setBgThreshold] = useState(18); // Background auto-keying tolerance (0-60)
  const [smoothness, setSmoothness] = useState(2); // Surface smoothing passes
  const [isWatertight, setIsWatertight] = useState(true); // Full front + back 3D solid

  // Motion & Lighting
  const [autoSpin, setAutoSpin] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(0.9);
  const [lightingPreset, setLightingPreset] = useState('studio'); // 'studio' | 'dramatic' | 'rim'
  const [isProcessing, setIsProcessing] = useState(false);
  const [pasteNotification, setPasteNotification] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshGroupRef = useRef(null);
  const lightsRef = useRef({});

  // 1. Initialize Scene & Controls
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

    // OrbitControls: Full 360° rotation in every axis, zoom & pan
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
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

  // 2. Global Clipboard Paste Listener (`Ctrl + V` anywhere!)
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
            showPasteToast('✓ Image pasted from clipboard & converted to 3D!');
            e.preventDefault();
            return;
          }
        }
      }

      // Check if user pasted an image URL text
      const text = e.clipboardData?.getData('text');
      if (text && (text.startsWith('http') || text.startsWith('data:image'))) {
        loadNewImage(text, 'Web Image Link');
        showPasteToast('✓ Loaded image URL and generating 3D model!');
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
    setCurrentImageUrl(url);
    setObjectName(name);
    setActivePreset({
      id: 'custom-' + Date.now(),
      name: name,
      category: 'Custom Input',
      image: url,
      description: 'Accurate volumetric 3D reconstruction generated from custom image.'
    });
  };

  // 3. Advanced Volumetric 3D Reconstruction Engine
  useEffect(() => {
    if (!currentImageUrl || !meshGroupRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;

    img.onload = () => {
      generateAccurate3DMesh(img);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [currentImageUrl, extrusionDepth, bulgeFactor, bgThreshold, smoothness, isWatertight, renderMode]);

  const generateAccurate3DMesh = (img) => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    // Clear previous models
    while (meshGroup.children.length > 0) {
      const obj = meshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      meshGroup.remove(obj);
    }

    // Grid sampling dimensions for high-fidelity contour
    const cols = 130;
    const rows = 130;

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cols, rows);
    const imgData = ctx.getImageData(0, 0, cols, rows);
    const data = imgData.data;

    // Step A: Detect Background Chroma Key from 4 Corners
    const sampleCorner = (x, y) => {
      const idx = (y * cols + x) * 4;
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    };
    const c1 = sampleCorner(0, 0);
    const c2 = sampleCorner(cols - 1, 0);
    const c3 = sampleCorner(0, rows - 1);
    const c4 = sampleCorner(cols - 1, rows - 1);
    const bgR = (c1[0] + c2[0] + c3[0] + c4[0]) / 4;
    const bgG = (c1[1] + c2[1] + c3[1] + c4[1]) / 4;
    const bgB = (c1[2] + c2[2] + c3[2] + c4[2]) / 4;

    // Step B: Build Foreground Mask & Distance Transform (For Organic Volumetric Bulge)
    const isForeground = new Uint8Array(cols * rows);
    const thresholdSq = (bgThreshold * 4) ** 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 30) {
          isForeground[y * cols + x] = 0;
          continue;
        }

        const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
        isForeground[y * cols + x] = distSq > thresholdSq ? 1 : 0;
      }
    }

    // Compute Distance from Nearest Background Edge (Chamfer Distance Transform)
    const distMap = new Float32Array(cols * rows);
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const idx = y * cols + x;
        if (!isForeground[idx]) {
          distMap[idx] = 0;
        } else {
          const minNeighbor = Math.min(
            distMap[idx - 1] + 1,
            distMap[idx - cols] + 1,
            distMap[idx - cols - 1] + 1.414,
            distMap[idx - cols + 1] + 1.414
          );
          distMap[idx] = minNeighbor;
        }
      }
    }
    // Backward pass
    for (let y = rows - 2; y >= 1; y--) {
      for (let x = cols - 2; x >= 1; x--) {
        const idx = y * cols + x;
        if (isForeground[idx]) {
          const minNeighbor = Math.min(
            distMap[idx],
            distMap[idx + 1] + 1,
            distMap[idx + cols] + 1,
            distMap[idx + cols + 1] + 1.414,
            distMap[idx + cols - 1] + 1.414
          );
          distMap[idx] = minNeighbor;
        }
      }
    }

    // Normalize Distance Map
    let maxDist = 1;
    for (let i = 0; i < distMap.length; i++) {
      if (distMap[i] > maxDist) maxDist = distMap[i];
    }

    // Step C: Construct 3D Watertight Solid Geometry
    const planeW = 4.4;
    const aspect = img.height / img.width;
    const planeH = planeW * aspect;

    const vertices = [];
    const normals = [];
    const uvs = [];
    const colors = [];
    const indices = [];

    // Vertex index map for front & back
    const frontIndexMap = new Int32Array(cols * rows).fill(-1);
    const backIndexMap = new Int32Array(cols * rows).fill(-1);

    let vCount = 0;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = y * cols + x;
        if (!isForeground[idx]) continue;

        const pxIdx = idx * 4;
        const r = data[pxIdx] / 255;
        const g = data[pxIdx + 1] / 255;
        const b = data[pxIdx + 2] / 255;

        // Hybrid Depth: Contour Distance Bulge + Shading Luminance Detail
        const normalizedDist = distMap[idx] / maxDist;
        const organicBulge = Math.sin(normalizedDist * Math.PI * 0.5) * bulgeFactor;
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const surfaceDetail = (1.0 - luminance) * 0.35;

        const zFront = (organicBulge + surfaceDetail) * extrusionDepth * 0.5;
        const zBack = isWatertight ? -organicBulge * extrusionDepth * 0.45 : 0;

        const vx = ((x / (cols - 1)) - 0.5) * planeW;
        const vy = -( (y / (rows - 1)) - 0.5) * planeH;
        const u = x / (cols - 1);
        const v = 1.0 - (y / (rows - 1));

        // Color for heatmap
        const heatHue = (1.0 - Math.min(1.0, zFront / (extrusionDepth * 1.5))) * 0.7;
        const heatColor = new THREE.Color().setHSL(heatHue, 0.9, 0.5);

        // Front Vertex
        frontIndexMap[idx] = vCount;
        vertices.push(vx, vy, zFront);
        uvs.push(u, v);
        colors.push(heatColor.r, heatColor.g, heatColor.b);
        vCount++;

        // Back Vertex (if Watertight Solid)
        if (isWatertight) {
          backIndexMap[idx] = vCount;
          vertices.push(vx, vy, zBack);
          uvs.push(u, v);
          colors.push(0.2, 0.2, 0.25);
          vCount++;
        }
      }
    }

    // Connect Faces (Triangulation for Foreground Quads)
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        const i0 = y * cols + x;
        const i1 = y * cols + (x + 1);
        const i2 = (y + 1) * cols + x;
        const i3 = (y + 1) * cols + (x + 1);

        const f0 = frontIndexMap[i0];
        const f1 = frontIndexMap[i1];
        const f2 = frontIndexMap[i2];
        const f3 = frontIndexMap[i3];

        // Front Facing Triangles
        if (f0 !== -1 && f1 !== -1 && f2 !== -1 && f3 !== -1) {
          indices.push(f0, f1, f2);
          indices.push(f1, f3, f2);
        }

        // Back Facing Triangles (reversed winding order)
        if (isWatertight) {
          const b0 = backIndexMap[i0];
          const b1 = backIndexMap[i1];
          const b2 = backIndexMap[i2];
          const b3 = backIndexMap[i3];

          if (b0 !== -1 && b1 !== -1 && b2 !== -1 && b3 !== -1) {
            indices.push(b2, b1, b0);
            indices.push(b2, b3, b1);
          }
        }
      }
    }

    // Step D: Construct Watertight Side Skirt Connecting Front Edge to Back Edge
    if (isWatertight) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x;
          if (!isForeground[idx]) continue;

          // Check if boundary neighbor
          const checkBoundary = (nx, ny) => {
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true;
            return !isForeground[ny * cols + nx];
          };

          const isEdge = 
            checkBoundary(x + 1, y) || 
            checkBoundary(x - 1, y) || 
            checkBoundary(x, y + 1) || 
            checkBoundary(x, y - 1);

          if (isEdge) {
            // Check right neighbor skirt
            if (x < cols - 1 && isForeground[idx + 1] && (checkBoundary(x, y - 1) || checkBoundary(x, y + 1))) {
              const fA = frontIndexMap[idx];
              const fB = frontIndexMap[idx + 1];
              const bA = backIndexMap[idx];
              const bB = backIndexMap[idx + 1];
              if (fA !== -1 && fB !== -1 && bA !== -1 && bB !== -1) {
                indices.push(fA, fB, bA);
                indices.push(fB, bB, bA);
              }
            }
          }
        }
      }
    }

    // Step E: Create Buffer Geometry & Compute Smooth Normals
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

    // Materials Setup based on Render Mode
    let material;
    if (renderMode === 'textured') {
      material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.3,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'clay') {
      material = new THREE.MeshPhysicalMaterial({
        color: 0xe2e8f0,
        roughness: 0.55,
        metalness: 0.05,
        clearcoat: 0.3,
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
        roughness: 0.18,
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
    } else if (renderMode === 'points') {
      const pMat = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true
      });
      const points = new THREE.Points(geometry, pMat);
      meshGroup.add(points);
      return;
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
      keyLight.intensity = 2.4;
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

  // Handle Drag & Drop onto Viewport
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      loadNewImage(url, file.name);
      showPasteToast('✓ File dropped & converted to 3D model!');
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
      
      {/* Universal Input Bar: Paste (Ctrl+V) · Upload · URL · Presets */}
      <div className="p-4 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Main Action Callouts: Copy-Paste Hero Tool */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>ANY IMAGE TO 3D ENGINE</span>
              </span>
              <span className="text-[11px] font-mono text-amber-500 font-bold">
                Press Ctrl + V to Paste Anywhere!
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">
              Paste Any Image, Screenshot, or Photo to Reconstruct 3D Form
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
                      loadNewImage(url, 'Pasted Image');
                      showPasteToast('✓ Clipboard image converted to 3D!');
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
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)] text-xs font-mono">
          <span className="text-[var(--text-subtle)]">Try Sample Presets:</span>
          {CEED_3D_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setActivePreset(p);
                setCurrentImageUrl(p.image);
                setObjectName(p.name);
                setExtrusionDepth(p.defaultExtrusion);
              }}
              className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                currentImageUrl === p.image
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 font-bold'
                  : 'bg-[var(--pill-bg)] text-[var(--text-body)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              <span>{p.name}</span>
            </button>
          ))}
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
              <span>Analyzing Silhouette &amp; Carving 3D Volume...</span>
            </div>
          </div>
        )}

        {/* Drag-and-Drop Active Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm border-4 border-dashed border-amber-500 rounded-3xl flex items-center justify-center z-40 pointer-events-none">
            <div className="p-6 rounded-3xl bg-black/80 text-amber-400 font-display font-bold text-lg flex items-center gap-3">
              <Upload className="w-6 h-6 animate-bounce" />
              <span>Drop Image Here to Generate 3D Object!</span>
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
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Active 3D Solid</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Watertight Mesh
            </span>
          </div>
          <h4 className="text-sm font-display font-bold text-white line-clamp-1">{objectName}</h4>
          <p className="text-[11px] text-slate-300">
            Rotate in any direction with mouse &middot; Zoom in/out with scroll
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
            Pinch/Scroll Zoom
          </span>
        </div>

        {/* Floating Bottom Toolbar: Shading, Relief, Cutout Tuning */}
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
                { id: 'points', label: 'Point Cloud', icon: Maximize2 }
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

            {/* Auto-Spin Control */}
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

              {/* Lighting Preset */}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs font-mono">
            
            {/* 3D Thickness Extrusion */}
            <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-300">3D Thickness:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={extrusionDepth}
                  onChange={(e) => setExtrusionDepth(parseFloat(e.target.value))}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="text-amber-400 font-bold w-8">{extrusionDepth}x</span>
              </div>
            </div>

            {/* Organic Bulge / Curvature */}
            <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-300">Organic Bulge:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={bulgeFactor}
                  onChange={(e) => setBulgeFactor(parseFloat(e.target.value))}
                  className="w-20 accent-sky-400 cursor-pointer"
                />
                <span className="text-sky-400 font-bold w-8">{bulgeFactor}x</span>
              </div>
            </div>

            {/* Background Cutout Sensitivity */}
            <div className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-slate-300">Cutout Filter:</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={bgThreshold}
                  onChange={(e) => setBgThreshold(parseInt(e.target.value))}
                  className="w-20 accent-emerald-400 cursor-pointer"
                />
                <span className="text-emerald-400 font-bold w-6">{bgThreshold}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
