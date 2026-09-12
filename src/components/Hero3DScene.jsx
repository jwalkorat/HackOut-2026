import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Wind, Zap, Sparkles, RotateCw, Activity, Compass } from 'lucide-react';

export default function Hero3DScene({ energyMode = 'hybrid', onModeChange }) {
  const containerRef = useRef(null);
  const [activeMode, setActiveMode] = useState(energyMode);
  const [telemetry, setTelemetry] = useState({
    rotorSpeed: '18.2 RPM',
    irradiance: '925 W/m²',
    gridOutput: '84.6 MW',
    gridFreq: '60.01 Hz'
  });

  // Sync mode if passed from parent
  useEffect(() => {
    if (energyMode && energyMode !== activeMode) {
      setActiveMode(energyMode);
    }
  }, [energyMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Light-Themed Atmospheric Fog
    const scene = new THREE.Scene();
    // Clean, soft sky-blue fog
    scene.fog = new THREE.FogExp2(0xe0f2fe, 0.014);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 13, 33);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0xf0f7ff, 1);
    container.appendChild(renderer.domElement);

    // World root group for smooth mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 2. Clean Light-Blue Grid Floor & Elegant Base Platform
    const gridHelper = new THREE.GridHelper(80, 40, 0x0284c7, 0xbae6fd);
    gridHelper.position.y = -0.05;
    gridHelper.material.opacity = 0.55;
    gridHelper.material.transparent = true;
    worldGroup.add(gridHelper);

    // Pristine circular base platform with subtle bevel
    const baseGeo = new THREE.CylinderGeometry(19, 20, 0.5, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.15,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.25;
    worldGroup.add(baseMesh);

    // Platform perimeter glowing ring
    const ringGeo = new THREE.RingGeometry(18.8, 19.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.02;
    worldGroup.add(ringMesh);

    // 3. Studio Balanced Lighting (Clean & Soft)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    sunLight.position.set(20, 32, 16);
    scene.add(sunLight);

    const skyFillLight = new THREE.PointLight(0xbae6fd, 1.8, 60);
    skyFillLight.position.set(-15, 14, 12);
    scene.add(skyFillLight);

    const warmAccentLight = new THREE.PointLight(0xfef3c7, 1.4, 60);
    warmAccentLight.position.set(15, 10, -12);
    scene.add(warmAccentLight);

    // ----------------------------------------------------
    // 4. CLEAN MODERN WIND TURBINES
    // ----------------------------------------------------
    const turbineRotorGroups = [];
    const turbineTowers = [];

    const createTurbine = (x, z, scale = 1, yawAngle = 0.15) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(x, 0, z);
      turbineGroup.scale.set(scale, scale, scale);

      // White tapered tower
      const towerGeo = new THREE.CylinderGeometry(0.24, 0.55, 12.5, 32);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.25,
        metalness: 0.1,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = 6.25;
      turbineGroup.add(tower);
      turbineTowers.push(tower);

      // Nacelle (Aerodynamic capsule)
      const nacelleGeo = new THREE.CylinderGeometry(0.5, 0.45, 2.2, 24);
      nacelleGeo.rotateX(Math.PI / 2);
      const nacelleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.2,
      });
      const nacelle = new THREE.Mesh(nacelleGeo, nacelleMat);
      nacelle.position.set(0, 12.5, 0);
      nacelle.rotation.y = yawAngle;
      turbineGroup.add(nacelle);

      // Cyan Hub Cone
      const hubGeo = new THREE.ConeGeometry(0.42, 0.9, 24);
      const hubMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.2,
        metalness: 0.5,
      });
      const hub = new THREE.Mesh(hubGeo, hubMat);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(0, 0, 1.2);
      nacelle.add(hub);

      // Spinning Rotor Group
      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 0, 1.35);
      nacelle.add(rotorGroup);

      // Modern Aerodynamic Turbine Blades (Clean White with Sky-Blue Tip Accent)
      const bladeShape = new THREE.Shape();
      bladeShape.moveTo(0, 0);
      bladeShape.lineTo(0.2, 1.0);
      bladeShape.lineTo(0.12, 6.2);
      bladeShape.lineTo(0, 6.6);
      bladeShape.lineTo(-0.12, 6.2);
      bladeShape.lineTo(-0.2, 1.0);
      bladeShape.closePath();

      const extrudeSettings = {
        depth: 0.05,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02
      };
      const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        metalness: 0.05,
      });

      for (let b = 0; b < 3; b++) {
        const bladeHolder = new THREE.Group();
        bladeHolder.rotation.z = (b * Math.PI * 2) / 3;

        const bladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
        bladeMesh.rotation.y = 0.06;
        bladeHolder.add(bladeMesh);

        // Clean Sky-Blue Tip Strip
        const tipGeo = new THREE.BoxGeometry(0.12, 0.6, 0.06);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        const tip = new THREE.Mesh(tipGeo, tipMat);
        tip.position.set(0, 6.3, 0.03);
        bladeHolder.add(tip);

        rotorGroup.add(bladeHolder);
      }

      turbineRotorGroups.push({ group: rotorGroup, baseSpeed: 0.022 + Math.random() * 0.004 });
      worldGroup.add(turbineGroup);
    };

    // Hero turbine & 2 flanking units
    createTurbine(-6.5, -2, 1.15, 0.2);
    createTurbine(-12.5, -9, 0.85, 0.15);
    createTurbine(-1.5, -11, 0.78, 0.22);

    // ----------------------------------------------------
    // 5. CLEAN HIGH-EFFICIENCY SOLAR PV ARRAYS
    // ----------------------------------------------------
    const solarPanels = [];
    const solarArrayGroup = new THREE.Group();
    solarArrayGroup.position.set(7.5, 0, 1.5);
    worldGroup.add(solarArrayGroup);

    const panelRows = 4;
    const panelCols = 5;
    const panelWidth = 1.85;
    const panelLength = 1.1;

    // Modern Deep Marine Blue Solar Glass Cell
    const panelGeo = new THREE.BoxGeometry(panelWidth, 0.04, panelLength);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.82,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });

    const frameGeo = new THREE.BoxGeometry(panelWidth + 0.06, 0.05, panelLength + 0.06);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.25,
    });

    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const singlePanelGroup = new THREE.Group();
        const posX = (c - (panelCols - 1) / 2) * (panelWidth + 0.3);
        const posZ = (r - (panelRows - 1) / 2) * (panelLength + 0.85);

        // Sleek silver aluminum racking legs
        const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.0, 12);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
        const frontLeg = new THREE.Mesh(legGeo, legMat);
        frontLeg.position.set(posX, 0.5, posZ + 0.3);
        solarArrayGroup.add(frontLeg);

        const backLeg = new THREE.Mesh(legGeo, legMat);
        backLeg.scale.y = 1.6;
        backLeg.position.set(posX, 0.8, posZ - 0.3);
        solarArrayGroup.add(backLeg);

        // Frame & Glass
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        const panelMesh = new THREE.Mesh(panelGeo, panelMat);
        panelMesh.position.y = 0.01;

        singlePanelGroup.add(frameMesh);
        singlePanelGroup.add(panelMesh);

        singlePanelGroup.position.set(posX, 0.95, posZ);
        singlePanelGroup.rotation.x = 0.46; // Optimum 26° tilt
        singlePanelGroup.rotation.y = -0.12;

        solarArrayGroup.add(singlePanelGroup);
        solarPanels.push(panelMesh);
      }
    }

    // ----------------------------------------------------
    // 6. SOFT WARM SUN & AMBIENT BEAMS
    // ----------------------------------------------------
    const sunVisualGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const sunVisualMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunVisual = new THREE.Mesh(sunVisualGeo, sunVisualMat);
    sunVisual.position.set(16, 26, -10);
    scene.add(sunVisual);

    // Warm Sun Halo
    const sunHaloGeo = new THREE.RingGeometry(1.8, 4.5, 32);
    const sunHaloMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const sunHalo = new THREE.Mesh(sunHaloGeo, sunHaloMat);
    sunVisual.add(sunHalo);

    // Clean, soft solar irradiance beams
    const rayBeamsGroup = new THREE.Group();
    scene.add(rayBeamsGroup);

    const rayBeamGeo = new THREE.CylinderGeometry(0.2, 1.4, 28, 16, 1, true);
    const rayBeamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 5; i++) {
      const beam = new THREE.Mesh(rayBeamGeo, rayBeamMat.clone());
      beam.position.set(12 - i * 1.6, 14, -3 + i * 1.6);
      beam.rotation.x = -0.58;
      beam.rotation.z = -0.38 + i * 0.04;
      rayBeamsGroup.add(beam);
    }

    // ----------------------------------------------------
    // 7. STREAMLINED AERODYNAMIC WIND CURVES (Clean & Elegant)
    // ----------------------------------------------------
    const windStreaksGroup = new THREE.Group();
    scene.add(windStreaksGroup);

    const streakCount = 24;
    for (let s = 0; s < streakCount; s++) {
      const yPos = 4 + Math.random() * 11;
      const zPos = -8 + Math.random() * 16;
      const curve = new THREE.LineCurve3(
        new THREE.Vector3(-22, yPos, zPos),
        new THREE.Vector3(14, yPos + (Math.random() - 0.5) * 1.5, zPos + (Math.random() - 0.5) * 2)
      );
      const points = curve.getPoints(24);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.25 + Math.random() * 0.25,
      });
      const line = new THREE.Line(geo, mat);
      line.userData = {
        speed: 0.16 + Math.random() * 0.18,
        startX: -22,
        endX: 14,
      };
      windStreaksGroup.add(line);
    }

    // ----------------------------------------------------
    // 8. CENTRAL BESS POWER HUB & ENERGY FLOW
    // ----------------------------------------------------
    const substationGroup = new THREE.Group();
    substationGroup.position.set(0, 0, 6.5);
    worldGroup.add(substationGroup);

    // Crisp White Energy Storage Enclosure
    const subGeo = new THREE.BoxGeometry(3.8, 1.4, 2.2);
    const subMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.2,
    });
    const subBox = new THREE.Mesh(subGeo, subMat);
    subBox.position.y = 0.7;
    substationGroup.add(subBox);

    // Glowing Core Window
    const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.95,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.1, 0);
    substationGroup.add(core);

    // Soft Pulse Ground Ring
    const pulseRingGeo = new THREE.RingGeometry(0.9, 2.8, 32);
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const pulseRing = new THREE.Mesh(pulseRingGeo, pulseRingMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.02;
    substationGroup.add(pulseRing);

    // Silky Smooth Flowing Energy Particle Streams
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const particlesFromWind = [];
    const particlesFromSolar = [];

    for (let p = 0; p < particleCount; p++) {
      const isWind = p % 2 === 0;
      const progress = Math.random();

      let x, y, z;
      if (isWind) {
        x = -6.5 + progress * 6.5;
        y = 12 - progress * 11.3;
        z = -2 + progress * 8.5;
        particlesFromWind.push({ index: p, progress, speed: 0.007 + Math.random() * 0.005 });
        // Cyan color
        particleColors[p * 3] = 0.01;
        particleColors[p * 3 + 1] = 0.52;
        particleColors[p * 3 + 2] = 0.78;
      } else {
        x = 7.5 - progress * 7.5;
        y = 1.2 - progress * 0.5;
        z = 1.5 + progress * 5.0;
        particlesFromSolar.push({ index: p, progress, speed: 0.007 + Math.random() * 0.005 });
        // Warm Amber color
        particleColors[p * 3] = 0.96;
        particleColors[p * 3 + 1] = 0.62;
        particleColors[p * 3 + 2] = 0.04;
      }

      particlePositions[p * 3] = x;
      particlePositions[p * 3 + 1] = y;
      particlePositions[p * 3 + 2] = z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending
    });
    const energyParticleSystem = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(energyParticleSystem);

    // ----------------------------------------------------
    // 9. SMOOTH MOUSE ORBIT PARALLAX
    // ----------------------------------------------------
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.28;
      targetRotationX = -y * 0.12;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ----------------------------------------------------
    // 10. CLEAN ANIMATION LOOP
    // ----------------------------------------------------
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera / world easing
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.06;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.06;

      sunHalo.lookAt(camera.position);

      const isWindActive = activeMode === 'wind' || activeMode === 'hybrid';
      const isSolarActive = activeMode === 'solar' || activeMode === 'hybrid';

      // 1. Wind Turbine Blades
      const windSpeedMultiplier = activeMode === 'wind' ? 2.2 : activeMode === 'hybrid' ? 1.0 : 0.25;
      turbineRotorGroups.forEach((item) => {
        item.group.rotation.z -= item.baseSpeed * windSpeedMultiplier;
      });

      // Wind Flow Streaks
      windStreaksGroup.visible = isWindActive;
      if (isWindActive) {
        windStreaksGroup.children.forEach((line) => {
          line.position.x += line.userData.speed * (activeMode === 'wind' ? 1.6 : 1.0);
          if (line.position.x > line.userData.endX) {
            line.position.x = line.userData.startX;
          }
        });
      }

      // 2. Solar Irradiance
      rayBeamsGroup.visible = isSolarActive;
      if (isSolarActive) {
        rayBeamsGroup.children.forEach((beam, idx) => {
          beam.material.opacity = 0.06 + Math.sin(elapsedTime * 2.0 + idx) * 0.04;
          if (activeMode === 'solar') beam.material.opacity *= 1.6;
        });

        solarPanels.forEach((panel) => {
          if (activeMode === 'solar') {
            panel.material.emissive.setHex(0xd97706);
            panel.material.emissiveIntensity = 0.45 + Math.sin(elapsedTime * 2.5) * 0.2;
          } else {
            panel.material.emissive.setHex(0x0284c7);
            panel.material.emissiveIntensity = 0.25;
          }
        });
      } else {
        solarPanels.forEach((panel) => {
          panel.material.emissive.setHex(0x0369a1);
          panel.material.emissiveIntensity = 0.12;
        });
      }

      // 3. Central Substation Pulse
      const ringScale = 1 + (elapsedTime % 2.2) * 1.4;
      pulseRing.scale.set(ringScale, ringScale, 1);
      pulseRingMat.opacity = Math.max(0, 0.5 - (elapsedTime % 2.2) * 0.22);

      if (activeMode === 'wind') {
        coreMat.color.setHex(0x059669); // Clean Wind Emerald
      } else if (activeMode === 'solar') {
        coreMat.color.setHex(0xd97706); // Solar Amber
      } else {
        coreMat.color.setHex(0x0284c7); // Hybrid Sky Blue
      }

      // 4. Smooth Particle Flows
      const positions = particleGeo.attributes.position.array;
      particlesFromWind.forEach((p) => {
        if (!isWindActive) return;
        p.progress += p.speed * (activeMode === 'wind' ? 1.5 : 1.0);
        if (p.progress > 1) p.progress = 0;

        const x = -6.5 + p.progress * 6.5;
        const y = 12 - p.progress * 11.3;
        const z = -2 + p.progress * 8.5;

        positions[p.index * 3] = x;
        positions[p.index * 3 + 1] = y + Math.sin(elapsedTime * 3 + p.index) * 0.1;
        positions[p.index * 3 + 2] = z;
      });

      particlesFromSolar.forEach((p) => {
        if (!isSolarActive) return;
        p.progress += p.speed * (activeMode === 'solar' ? 1.5 : 1.0);
        if (p.progress > 1) p.progress = 0;

        const x = 7.5 - p.progress * 7.5;
        const y = 1.2 - p.progress * 0.5;
        const z = 1.5 + p.progress * 5.0;

        positions[p.index * 3] = x;
        positions[p.index * 3 + 1] = y + Math.sin(elapsedTime * 3 + p.index) * 0.1;
        positions[p.index * 3 + 2] = z;
      });

      particleGeo.attributes.position.needsUpdate = true;

      // Telemetry Simulation Update
      if (Math.floor(elapsedTime * 3) % 15 === 0) {
        if (activeMode === 'wind') {
          setTelemetry({
            rotorSpeed: `${(24.4 + Math.sin(elapsedTime) * 1.5).toFixed(1)} RPM`,
            irradiance: '140 W/m²',
            gridOutput: `${(76.2 + Math.cos(elapsedTime) * 2.8).toFixed(1)} MW`,
            gridFreq: '60.02 Hz'
          });
        } else if (activeMode === 'solar') {
          setTelemetry({
            rotorSpeed: '3.8 RPM (Idle)',
            irradiance: `${Math.round(960 + Math.sin(elapsedTime) * 15)} W/m²`,
            gridOutput: `${(86.5 + Math.sin(elapsedTime) * 2.1).toFixed(1)} MW`,
            gridFreq: '59.99 Hz'
          });
        } else {
          setTelemetry({
            rotorSpeed: `${(18.2 + Math.sin(elapsedTime) * 0.6).toFixed(1)} RPM`,
            irradiance: `${Math.round(925 + Math.sin(elapsedTime) * 10)} W/m²`,
            gridOutput: `${(94.1 + Math.sin(elapsedTime) * 2.0).toFixed(1)} MW`,
            gridFreq: '60.01 Hz'
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeMode]);

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border border-sky-200/80 bg-gradient-to-b from-[#f0f9ff] via-[#e6f4fe] to-[#dbeafe] shadow-[0_10px_35px_-8px_rgba(2,132,199,0.15)]">
      {/* 3D WebGL Canvas Container with touch-action pan-y so page scroll is never blocked */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none [touch-action:pan-y]" />

      {/* Subtle Dot Grid Overlay for Technical Blueprint aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08] pointer-events-none" />

      {/* Top Floating Control Bar: Energy Mode Switcher */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-auto">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/90 backdrop-blur-md border border-sky-200/80 shadow-sm">
          <button
            onClick={() => handleModeSelect('hybrid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'hybrid'
                ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white shadow-glow-sky'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hybrid Co-Gen</span>
          </button>

          <button
            onClick={() => handleModeSelect('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'wind'
                ? 'bg-emerald-600 text-white shadow-glow-emerald'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Priority</span>
          </button>

          <button
            onClick={() => handleModeSelect('solar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeMode === 'solar'
                ? 'bg-amber-500 text-white shadow-glow-solar'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar Peak</span>
          </button>
        </div>

        {/* Live Simulation Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-sky-200/80 text-xs font-mono text-sky-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wide">3D Digital Twin Synchronized</span>
        </div>
      </div>

      {/* Floating HUD Telemetry Card in Light Blue Theme */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 pointer-events-auto">
        <div className="p-4 rounded-2xl bg-white/92 backdrop-blur-xl border border-sky-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-sky-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">Real-Time Substation Telemetry</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Live Stream
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Wind className="w-3 h-3 text-sky-600" />
                <span>Turbine Velocity</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {telemetry.rotorSpeed}
              </div>
              <div className="text-[10px] text-sky-700 font-mono mt-0.5">
                {activeMode === 'wind' ? '↑ High Velocity Mode' : 'Continuous Yaw'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Sun className="w-3 h-3 text-amber-600" />
                <span>Solar Irradiance</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                {telemetry.irradiance}
              </div>
              <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                {activeMode === 'solar' ? '⚡ Peak Noon Insolation' : 'Standard STC Direct'}
              </div>
            </div>
          </div>

          {/* Substation & Grid Sync readout */}
          <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              Grid Injection:
            </span>
            <span className="text-sky-700 font-bold">{telemetry.gridOutput} • {telemetry.gridFreq}</span>
          </div>
        </div>
      </div>

      {/* Orbit Interaction Hint */}
      <div className="absolute top-18 right-4 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-sky-200 text-[10px] font-mono text-slate-600 pointer-events-none shadow-sm">
        <RotateCw className="w-3 h-3 text-sky-600 animate-spin-slow" />
        <span>Drag to orbit digital twin</span>
      </div>
    </div>
  );
}
