import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Upload, RotateCw, ZoomIn, ZoomOut, Eye, Layers, Sun, Download, RefreshCw, Box, Sparkles, Check, Play, Pause } from 'lucide-react';
import { CEED_3D_PRESETS } from './ceedPresets';

export default function SpatialScanner3D() {
  const mountRef = useRef(null);
  const fileInputRef = useRef(null);

  // Active state
  const [activePreset, setActivePreset] = useState(CEED_3D_PRESETS[0]);
  const [currentImageUrl, setCurrentImageUrl] = useState(CEED_3D_PRESETS[0].image);
  const [renderMode, setRenderMode] = useState('textured'); // 'textured' | 'wireframe' | 'clay' | 'heatmap' | 'points'
  const [extrusionDepth, setExtrusionDepth] = useState(1.4);
  const [autoSpin, setAutoSpin] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(1.0);
  const [lightingPreset, setLightingPreset] = useState('studio'); // 'studio' | 'dramatic' | 'rim'
  const [isProcessing, setIsProcessing] = useState(false);

  // Three.js internal references
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshGroupRef = useRef(null);
  const lightsRef = useRef({});

  // 1. Initialize Three.js Scene & OrbitControls
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(4.5, 3.2, 5.5);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // OrbitControls for Full 360° Spin, Pan & Zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.minDistance = 2.0;
    controls.maxDistance = 16.0;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Mesh Group
    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x38bdf8, 12, 20);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf59e0b, 15, 20);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    lightsRef.current = { ambientLight, keyLight, fillLight, rimLight };

    // Grid Floor for Spatial Reference (vital for CEED spatial scale)
    const gridHelper = new THREE.GridHelper(10, 20, 0xf59e0b, 0x475569);
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
        meshGroupRef.current.rotation.y += 0.008 * spinSpeed;
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

  // 2. Rebuild 3D Mesh whenever Image, Extrusion Depth, or Render Mode changes
  useEffect(() => {
    if (!currentImageUrl || !meshGroupRef.current) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;

    img.onload = () => {
      build3DObjectFromImage(img);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  }, [currentImageUrl, extrusionDepth, renderMode]);

  // Image Processing & Spatial Geometry Generator
  const build3DObjectFromImage = (img) => {
    const meshGroup = meshGroupRef.current;
    if (!meshGroup) return;

    // Clear previous children
    while (meshGroup.children.length > 0) {
      const obj = meshGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
      meshGroup.remove(obj);
    }

    // 1. Analyze Depth via Offscreen Canvas
    const canvas = document.createElement('canvas');
    const width = 120;
    const height = 120;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    // 2. Build 3D Displacement Plane Geometry
    const planeWidth = 4.2;
    const planeHeight = (4.2 * img.height) / img.width;
    const geo = new THREE.PlaneGeometry(planeWidth, planeHeight, width - 1, height - 1);
    const pos = geo.attributes.position;

    // Color attribute for Heatmap / Point Cloud
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const pxIndex = i * 4;
      const r = pixels[pxIndex] / 255;
      const g = pixels[pxIndex + 1] / 255;
      const b = pixels[pxIndex + 2] / 255;
      const a = pixels[pxIndex + 3] / 255;

      // Weighted luminance formula for depth estimation
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const invertLuminance = 1.0 - luminance;
      const zDepth = invertLuminance * extrusionDepth * (a > 0.1 ? 1 : 0);

      pos.setZ(i, zDepth);

      // Rainbow Heatmap color interpolation
      const heatHue = (1.0 - invertLuminance) * 0.7; // Blue to Red
      const color = new THREE.Color().setHSL(heatHue, 0.9, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 3. Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(currentImageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;

    // 4. Material Setup based on Mode
    let mainMaterial;
    if (renderMode === 'textured') {
      mainMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.25,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'wireframe') {
      mainMaterial = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'clay') {
      mainMaterial = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'heatmap') {
      mainMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });
    } else if (renderMode === 'points') {
      const pMaterial = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true
      });
      const points = new THREE.Points(geo, pMaterial);
      meshGroup.add(points);
      return;
    }

    const mesh = new THREE.Mesh(geo, mainMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshGroup.add(mesh);

    // Add Solid Backing Plate for Physical Mass
    const backGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.BackSide
    });
    const backMesh = new THREE.Mesh(backGeo, backMat);
    backMesh.position.z = 0;
    meshGroup.add(backMesh);
  };

  // Preset Lighting switcher
  useEffect(() => {
    const { keyLight, fillLight, rimLight } = lightsRef.current;
    if (!keyLight) return;

    if (lightingPreset === 'studio') {
      keyLight.intensity = 2.2;
      keyLight.position.set(5, 7, 6);
      fillLight.intensity = 12;
      rimLight.intensity = 15;
    } else if (lightingPreset === 'dramatic') {
      keyLight.intensity = 3.5;
      keyLight.position.set(6, 2, 4);
      fillLight.intensity = 3;
      rimLight.intensity = 22;
    } else if (lightingPreset === 'rim') {
      keyLight.intensity = 0.8;
      fillLight.intensity = 5;
      rimLight.intensity = 35;
      rimLight.position.set(0, 5, -6);
    }
  }, [lightingPreset]);

  // Handle Custom File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCurrentImageUrl(url);
    setActivePreset({
      id: 'custom-upload',
      name: file.name.substring(0, 24) || 'Custom Object Photo',
      category: 'User Upload',
      image: url,
      description: 'Custom 2D photograph converted into interactive 3D spatial geometry.',
      spatialDifficulty: 'Custom Analysis',
      defaultExtrusion: 1.5,
      tags: ['Custom Upload', 'Auto 3D Mesh']
    });
  };

  // Reset Camera View to Default 30° Isometric
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4.5, 3.2, 5.5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Capture High-Res 3D Snapshot
  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ceed-spatial-model-${activePreset.id || 'view'}.png`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Presets Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
        
        {/* Preset Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-subtle)] font-semibold flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Practice Object or Upload Custom:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {CEED_3D_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setActivePreset(preset);
                  setCurrentImageUrl(preset.image);
                  setExtrusionDepth(preset.defaultExtrusion);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activePreset.id === preset.id
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[var(--pill-bg)] text-[var(--text-body)] hover:text-[var(--text-heading)] border border-[var(--border-color)]'
                }`}
              >
                <span>{preset.name}</span>
                {activePreset.id === preset.id && <Check className="w-3 h-3" />}
              </button>
            ))}

            {/* Custom Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Any Photo</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--pill-bg)] text-xs text-[var(--text-body)] hover:text-amber-500 transition-all"
            title="Reset 3D camera to default isometric view"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset View</span>
          </button>

          <button
            onClick={handleDownloadSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md active:scale-95"
            title="Save current 3D perspective angle as PNG"
          >
            <Download className="w-3 h-3" />
            <span>Save 3D Angle</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport & Floating Control Bar */}
      <div className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden glass-panel border border-[var(--border-color)] shadow-2xl bg-gradient-to-b from-black/40 via-black/20 to-black/60">
        
        {/* The Three.js WebGL Mount */}
        <div 
          ref={mountRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing"
          title="360° Interactive Orbit: Left click drag to spin, right click to pan, scroll to zoom"
        />

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-panel border border-amber-500/30 text-amber-500 text-xs font-mono font-bold animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Reconstructing 3D Spatial Mesh...</span>
            </div>
          </div>
        )}

        {/* Floating Top-Left: Active Model Details & CEED Spatial Notes */}
        <div className="absolute top-4 left-4 z-20 max-w-xs p-3.5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-1 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-amber-500 font-bold">{activePreset.category}</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Difficulty: {activePreset.spatialDifficulty}
            </span>
          </div>
          <h3 className="text-sm font-display font-bold text-[var(--text-heading)]">{activePreset.name}</h3>
          <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">{activePreset.description}</p>
        </div>

        {/* Floating Top-Right: Interaction Guide (CEED Visualization Cheat) */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl glass-panel border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-subtle)] backdrop-blur-xl shadow-lg">
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <RotateCw className="w-3 h-3 animate-spin-slow" />
            360° Drag Orbit
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <ZoomIn className="w-3 h-3" />
            Scroll Zoom
          </span>
          <span>&middot;</span>
          <span>Right-Click Pan</span>
        </div>

        {/* Floating Bottom Toolbar: Shading Modes & Spatial Sliders */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-[var(--border-color)] backdrop-blur-xl shadow-2xl">
          
          {/* Shading Render Modes */}
          <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-[var(--border-color)]">
            {[
              { id: 'textured', label: 'Realistic Texture', icon: Eye },
              { id: 'wireframe', label: 'Wireframe Mesh', icon: Layers },
              { id: 'clay', label: 'Clay Render', icon: Box },
              { id: 'heatmap', label: 'Depth Heatmap', icon: Sparkles },
              { id: 'points', label: 'Point Cloud', icon: RefreshCw }
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setRenderMode(mode.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    renderMode === mode.id
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'text-[var(--text-subtle)] hover:text-[var(--text-heading)]'
                  }`}
                  title={`Switch to ${mode.label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Depth Extrusion Slider */}
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs font-mono">
            <span className="text-[var(--text-subtle)]">3D Relief:</span>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={extrusionDepth}
              onChange={(e) => setExtrusionDepth(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer"
            />
            <span className="text-amber-500 font-bold">{extrusionDepth}x</span>
          </div>

          {/* Auto Spin Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpin(!autoSpin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
                autoSpin
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                  : 'border-[var(--border-color)] bg-[var(--pill-bg)] text-[var(--text-subtle)]'
              }`}
            >
              {autoSpin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoSpin ? 'Spinning' : 'Paused'}</span>
            </button>

            {/* Lighting Preset Picker */}
            <div className="hidden sm:flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-[var(--border-color)] text-[11px] font-mono">
              <Sun className="w-3.5 h-3.5 text-amber-500 ml-1.5" />
              {['studio', 'dramatic', 'rim'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLightingPreset(l)}
                  className={`px-2 py-1 rounded-lg capitalize transition-all ${
                    lightingPreset === l
                      ? 'bg-white/20 text-white font-bold'
                      : 'text-[var(--text-subtle)] hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
