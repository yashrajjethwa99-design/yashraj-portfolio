import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export default function ThreeHeroCanvas() {
  const mountRef = useRef(null);
  const { isDark } = useTheme();
  const sceneRef = useRef(null);
  const materialsRef = useRef({});

  // Initialize Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7.0;

    // 2. WebGL Renderer with High Precision & Transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // 3. Central 3D Floating Yashraj Font Assembly (NO PLATE - PURE 3D FONT)
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Load High-Res Yashraj Graffiti Logo Texture
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load('/yashraj_logo.png', (tex) => {
      tex.anisotropy = 16;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      renderer.render(scene, camera);
    });

    // 3D Extruded Font Thickness Effect using Multi-Layered Slices
    // Ratio of logo: ~3.28:1 (width 4.4, height 1.34)
    const fontWidth = 4.4;
    const fontHeight = 1.34;
    const fontGeo = new THREE.PlaneGeometry(fontWidth, fontHeight);

    // Front Face (Primary Vibrant Material)
    const frontMat = new THREE.MeshStandardMaterial({
      map: logoTexture,
      transparent: true,
      roughness: 0.18,
      metalness: 0.25,
      emissive: 0x3b0764, // Deep purple ambient emission matching graffiti
      emissiveIntensity: 0.4,
      alphaTest: 0.05,
      side: THREE.FrontSide
    });
    const frontFont = new THREE.Mesh(fontGeo, frontMat);
    frontFont.position.z = 0.07;
    logoGroup.add(frontFont);

    // Back Face (Mirrored so text reads correctly from 180° rear view)
    const backFont = new THREE.Mesh(fontGeo, frontMat);
    backFont.position.z = -0.07;
    backFont.rotation.y = Math.PI;
    logoGroup.add(backFont);

    // Volumetric 3D Depth Slices (Giving the floating font physical thickness & edge presence)
    const depthSlices = [];
    const depthCount = 6;
    const depthSpan = 0.12; // total thickness
    const step = depthSpan / depthCount;

    for (let i = 0; i <= depthCount; i++) {
      const zOffset = -depthSpan / 2 + i * step;
      // Skip exact front and back positions
      if (Math.abs(zOffset - 0.07) < 0.015 || Math.abs(zOffset + 0.07) < 0.015) continue;

      const sliceMat = new THREE.MeshStandardMaterial({
        map: logoTexture,
        transparent: true,
        roughness: 0.25,
        metalness: 0.5,
        emissive: 0xf59e0b, // Golden core edge glow
        emissiveIntensity: 0.25,
        opacity: 0.75,
        alphaTest: 0.08,
        side: THREE.DoubleSide
      });

      const slice = new THREE.Mesh(fontGeo, sliceMat);
      slice.position.z = zOffset;
      // Micro scale taper for embossed bevel feel
      const scaleFactor = 1 - Math.abs(zOffset) * 0.05;
      slice.scale.set(scaleFactor, scaleFactor, 1);
      logoGroup.add(slice);
      depthSlices.push({ mesh: slice, mat: sliceMat });
    }

    // Outer Wireframe Kinetic Cage
    const wireGeo = new THREE.IcosahedronGeometry(2.6, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xf59e0b : 0xd97706,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.22 : 0.35
    });
    const wireCage = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireCage);

    // Dynamic Gyroscope Ring 1 (Luxury Gold)
    const ringGeo1 = new THREE.TorusGeometry(2.8, 0.024, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xb45309,
      emissiveIntensity: 0.55
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    scene.add(ring1);

    // Dynamic Gyroscope Ring 2 (Purple/Cyan tone matching logo palette)
    const ringGeo2 = new THREE.TorusGeometry(3.1, 0.022, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.5
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2.7;
    scene.add(ring2);

    // Orbiting Geometric Particles
    const floatingBits = [];
    const bitMats = [
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.15 })
    ];

    for (let i = 0; i < 7; i++) {
      const geo = i % 2 === 0 ? new THREE.BoxGeometry(0.2, 0.2, 0.2) : new THREE.TetrahedronGeometry(0.24);
      const mesh = new THREE.Mesh(geo, bitMats[i % bitMats.length]);
      const angle = (i / 7) * Math.PI * 2;
      const radius = 3.2 + Math.random() * 0.4;
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 2.2, Math.sin(angle) * radius);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      floatingBits.push({ mesh, speed: 0.015 + Math.random() * 0.02, rotSpeed: 0.025 });
    }

    // Floating Stardust Particles
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.05,
      transparent: true,
      opacity: isDark ? 0.7 : 0.45,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.0 : 1.35);
    scene.add(ambientLight);

    const goldPoint = new THREE.PointLight(0xf59e0b, 25, 30);
    goldPoint.position.set(4, 3, 5);
    scene.add(goldPoint);

    const purplePoint = new THREE.PointLight(0xc084fc, 22, 30);
    purplePoint.position.set(-5, -3, 3);
    scene.add(purplePoint);

    const topWhiteLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.5 : 2.0);
    topWhiteLight.position.set(0, 6, 5);
    scene.add(topWhiteLight);

    // Save refs for dynamic theme updates
    materialsRef.current = {
      wireMat,
      ambientLight,
      topWhiteLight,
      particleMat
    };

    // 5. Interactive Physics, Sensitivity & Fast Auto-Rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    // Balanced Automatic Rotation Angle (User requested: "thoda slow rakh, naa jyada fast naa jyada slow")
    let autoSpinY = 0;
    const AUTO_SPIN_SPEED = 0.010; // Perfectly balanced, elegant studio spin speed

    // High Sensitivity Dragging State
    let isDragging = false;
    let dragRotX = 0;
    let dragRotY = 0;
    let dragVelocityX = 0;
    let dragVelocityY = 0;
    let prevMousePos = { x: 0, y: 0 };
    const DRAG_SENSITIVITY = 0.020; // Smooth & responsive

    // Mouse Move (Hover Tilt & Lighting Control)
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x;
      mouseY = y;

      if (isDragging) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        
        dragRotY += deltaX * DRAG_SENSITIVITY;
        dragRotX += deltaY * DRAG_SENSITIVITY;
        
        dragVelocityY = deltaX * DRAG_SENSITIVITY;
        dragVelocityX = deltaY * DRAG_SENSITIVITY;
        
        prevMousePos = { x: e.clientX, y: e.clientY };
      } else {
        // Natural hover tilt
        targetTiltY = x * 0.8;
        targetTiltX = -y * 0.65;
      }
    };

    // Mouse Down (Start Drag)
    const handleMouseDown = (e) => {
      isDragging = true;
      dragVelocityX = 0;
      dragVelocityY = 0;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    // Mouse Up (Release with Momentum Inertia)
    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch Support for Mobile / Tablets
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragVelocityX = 0;
        dragVelocityY = 0;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;
        dragRotY += deltaX * DRAG_SENSITIVITY;
        dragRotX += deltaY * DRAG_SENSITIVITY;
        dragVelocityY = deltaX * DRAG_SENSITIVITY;
        dragVelocityX = deltaY * DRAG_SENSITIVITY;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 6. Animation Loop
    let animId;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Continuous Fast Automatic Spin
      if (!isDragging) {
        autoSpinY += AUTO_SPIN_SPEED;
        // Inertia decay from drag
        dragRotY += dragVelocityY;
        dragRotX += dragVelocityX;
        dragVelocityY *= 0.93;
        dragVelocityX *= 0.93;
      }

      // Smooth Lerp for Mouse Hover Tilt (Highly responsive 0.08 damping)
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltY += (targetTiltY - currentTiltY) * 0.08;

      // Apply Combined 3D Transformations to the Pure Yashraj Font
      logoGroup.rotation.y = autoSpinY + dragRotY + currentTiltY;
      logoGroup.rotation.x = dragRotX + currentTiltX;

      // Floating Sine Levitation (gentle calm wave)
      logoGroup.position.y = Math.sin(elapsed * 1.5) * 0.08;

      // Kinetic outer rings & cage with balanced studio speeds
      wireCage.rotation.y = -elapsed * 0.12;
      wireCage.rotation.x = Math.sin(elapsed * 0.3) * 0.14;

      ring1.rotation.x = elapsed * 0.22;
      ring1.rotation.y = elapsed * 0.32;

      ring2.rotation.y = -elapsed * 0.26;
      ring2.rotation.z = elapsed * 0.18;

      particles.rotation.y = -elapsed * 0.04;

      // Orbiting geometric particles
      floatingBits.forEach((bit, idx) => {
        bit.mesh.rotation.x += bit.rotSpeed;
        bit.mesh.rotation.y += bit.rotSpeed;
        bit.mesh.position.y += Math.sin(elapsed * 2.5 + idx) * 0.008;
      });

      // Mouse-driven Dynamic Specular Lighting
      goldPoint.position.x = 4 + mouseX * 4;
      goldPoint.position.y = 3 - mouseY * 3.5;
      purplePoint.position.x = -5 - mouseX * 3;

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
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      fontGeo.dispose();
      frontMat.dispose();
      depthSlices.forEach(s => {
        s.mat.dispose();
      });
      wireGeo.dispose();
      wireMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      bitMats.forEach(m => m.dispose());
      logoTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // Update materials when theme changes
  useEffect(() => {
    const { wireMat, ambientLight, topWhiteLight, particleMat } = materialsRef.current;
    if (!wireMat) return;

    if (isDark) {
      wireMat.color.setHex(0xf59e0b);
      wireMat.opacity = 0.22;
      ambientLight.intensity = 1.0;
      topWhiteLight.intensity = 1.5;
      particleMat.opacity = 0.7;
    } else {
      wireMat.color.setHex(0xd97706);
      wireMat.opacity = 0.35;
      ambientLight.intensity = 1.35;
      topWhiteLight.intensity = 2.0;
      particleMat.opacity = 0.45;
    }
  }, [isDark]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[500px] lg:min-h-[620px] cursor-grab active:cursor-grabbing select-none touch-none"
      title="Interactive 3D Yashraj Font - Hover or drag to steer & spin in 3D"
    />
  );
}
