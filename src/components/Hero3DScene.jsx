import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sun, Wind, Zap, RotateCw, Activity } from 'lucide-react';

function makeCanvasTexture(draw, width, height, anisotropy = 8) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function makeSolarCellTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#072445';
    ctx.fillRect(0, 0, w, h);

    const cols = 6;
    const rows = 4;
    const gap = 5;
    const cellW = (w - gap * (cols + 1)) / cols;
    const cellH = (h - gap * (rows + 1)) / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = gap + c * (cellW + gap);
        const y = gap + r * (cellH + gap);
        const gradient = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
        gradient.addColorStop(0, '#1d6fb8');
        gradient.addColorStop(0.45, '#0d4f8a');
        gradient.addColorStop(1, '#08325d');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, cellW, cellH);

        ctx.strokeStyle = 'rgba(226, 232, 240, 0.42)';
        ctx.lineWidth = 0.8;
        for (let i = 1; i < 5; i++) {
          const lx = x + (cellW * i) / 5;
          ctx.beginPath();
          ctx.moveTo(lx, y + 1);
          ctx.lineTo(lx, y + cellH - 1);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + cellH * 0.5);
        ctx.lineTo(x + cellW - 2, y + cellH * 0.5);
        ctx.stroke();
      }
    }
  }, 1024, 512, 16);
}

function makeGroundTexture() {
  return makeCanvasTexture((ctx, w, h) => {
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2);
    gradient.addColorStop(0, '#e8f2ff');
    gradient.addColorStop(0.55, '#d7e8f8');
    gradient.addColorStop(1, '#c5d9ee');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = `rgba(148, 163, 184, ${Math.random() * 0.08})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
  }, 1024, 1024, 8);
}

function makeSoftParticleTexture() {
  return makeCanvasTexture((ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  }, 64, 64, 1);
}

function createAirfoilBladeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.12);
  shape.bezierCurveTo(0.32, 0.5, 0.34, 1.6, 0.26, 3.1);
  shape.bezierCurveTo(0.16, 5.0, 0.08, 6.2, 0.03, 6.85);
  shape.lineTo(0, 6.95);
  shape.bezierCurveTo(-0.05, 6.2, -0.1, 5.0, -0.14, 3.1);
  shape.bezierCurveTo(-0.18, 1.6, -0.12, 0.5, 0, 0.12);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 2,
    bevelSize: 0.018,
    bevelThickness: 0.02,
  });
  geometry.center();
  geometry.translate(0, 3.15, 0);

  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    const twist = (y / 6.9) * 0.42;
    const x = position.getX(i);
    const z = position.getZ(i);
    const cos = Math.cos(twist);
    const sin = Math.sin(twist);
    position.setX(i, x * cos - z * sin);
    position.setZ(i, x * sin + z * cos);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export default function Hero3DScene({ energyMode = 'hybrid', onModeChange }) {
  const containerRef = useRef(null);
  const modeRef = useRef(energyMode);
  const [activeMode, setActiveMode] = useState(energyMode);
  const [telemetry, setTelemetry] = useState({
    rotorSpeed: '18.2 RPM',
    irradiance: '925 W/m²',
    gridOutput: '84.6 MW',
    gridFreq: '60.01 Hz',
  });

  useEffect(() => {
    if (energyMode && energyMode !== activeMode) {
      setActiveMode(energyMode);
    }
  }, [energyMode]);

  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xe8f2fb, 28, 78);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 12.4, 30.5);
    camera.lookAt(0, 4.2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0xf0f7ff, 0);
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0xcbd5e1, 0.85);
    scene.add(hemi);

    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.42);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e8, 2.35);
    sunLight.position.set(18, 28, 14);
    sunLight.castShadow = !isMobile;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 4;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -28;
    sunLight.shadow.camera.right = 28;
    sunLight.shadow.camera.top = 22;
    sunLight.shadow.camera.bottom = -16;
    sunLight.shadow.bias = -0.00025;
    sunLight.shadow.normalBias = 0.035;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-16, 10, -12);
    scene.add(rimLight);

    const warmFill = new THREE.PointLight(0xfde68a, 18, 42, 2);
    warmFill.position.set(14, 9, -8);
    scene.add(warmFill);

    const skyFill = new THREE.PointLight(0x7dd3fc, 14, 40, 2);
    skyFill.position.set(-12, 12, 10);
    scene.add(skyFill);

    const groundTex = makeGroundTexture();
    groundTex.wrapS = groundTex.wrapT = THREE.ClampToEdgeWrapping;
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(22, 96),
      new THREE.MeshStandardMaterial({
        map: groundTex,
        color: 0xffffff,
        roughness: 0.88,
        metalness: 0.04,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    worldGroup.add(ground);

    const gridHelper = new THREE.GridHelper(44, 22, 0x7dd3fc, 0xbae6fd);
    gridHelper.position.y = 0.012;
    gridHelper.material.opacity = 0.28;
    gridHelper.material.transparent = true;
    worldGroup.add(gridHelper);

    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(18.4, 19.2, 0.42, 96),
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.22,
        metalness: 0.28,
        envMapIntensity: 1.1,
      })
    );
    baseMesh.position.y = -0.2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    worldGroup.add(baseMesh);

    const ringMesh = new THREE.Mesh(
      new THREE.RingGeometry(18.15, 18.55, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        roughness: 0.18,
        metalness: 0.6,
        emissive: 0x0284c7,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide,
      })
    );
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.03;
    worldGroup.add(ringMesh);

    const whitePaint = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.18,
      metalness: 0.22,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    });
    const hubPaint = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      roughness: 0.16,
      metalness: 0.72,
      clearcoat: 0.4,
    });
    const bladePaint = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.14,
      metalness: 0.08,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
    });
    const bladeTipPaint = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.22,
      metalness: 0.45,
      emissive: 0x0369a1,
      emissiveIntensity: 0.18,
    });

    const bladeGeo = createAirfoilBladeGeometry();
    const turbineRotorGroups = [];

    const createTurbine = (x, z, scale = 1, yawAngle = 0.15) => {
      const turbineGroup = new THREE.Group();
      turbineGroup.position.set(x, 0, z);
      turbineGroup.scale.setScalar(scale);

      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.58, 12.6, 48), whitePaint);
      tower.position.y = 6.3;
      tower.castShadow = true;
      tower.receiveShadow = true;
      turbineGroup.add(tower);

      const nacelleGroup = new THREE.Group();
      nacelleGroup.position.set(0, 12.62, 0);
      nacelleGroup.rotation.y = yawAngle;
      turbineGroup.add(nacelleGroup);

      const nacelle = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 1.55, 10, 24), whitePaint);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.castShadow = true;
      nacelleGroup.add(nacelle);

      const hub = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.82, 32), hubPaint);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(0, 0, 1.18);
      nacelleGroup.add(hub);

      const rotorGroup = new THREE.Group();
      rotorGroup.position.set(0, 0, 1.28);
      nacelleGroup.add(rotorGroup);

      for (let b = 0; b < 3; b++) {
        const bladeHolder = new THREE.Group();
        bladeHolder.rotation.z = (b * Math.PI * 2) / 3;
        const bladeMesh = new THREE.Mesh(bladeGeo, bladePaint);
        bladeMesh.rotation.y = 0.08;
        bladeMesh.castShadow = true;
        bladeHolder.add(bladeMesh);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.05), bladeTipPaint);
        tip.position.set(0, 6.42, 0.01);
        bladeHolder.add(tip);
        rotorGroup.add(bladeHolder);
      }

      turbineRotorGroups.push({ group: rotorGroup, baseSpeed: 0.018 + Math.random() * 0.006 });
      worldGroup.add(turbineGroup);
    };

    createTurbine(-6.5, -2, 1.12, 0.18);
    createTurbine(-12.4, -9, 0.84, 0.12);
    createTurbine(-1.6, -11, 0.76, 0.22);

    const solarArrayGroup = new THREE.Group();
    solarArrayGroup.position.set(7.4, 0, 1.4);
    worldGroup.add(solarArrayGroup);

    const solarMap = makeSolarCellTexture();
    const panelMat = new THREE.MeshPhysicalMaterial({
      map: solarMap,
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.55,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      reflectivity: 0.9,
      emissive: 0x0369a1,
      emissiveIntensity: 0.12,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd6dee8,
      metalness: 0.88,
      roughness: 0.22,
    });
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.78,
      roughness: 0.28,
    });

    const panelRows = 4;
    const panelCols = 5;
    const panelWidth = 1.85;
    const panelLength = 1.1;
    const panelGeo = new THREE.BoxGeometry(panelWidth, 0.028, panelLength);
    const frameGeo = new THREE.BoxGeometry(panelWidth + 0.07, 0.04, panelLength + 0.07);
    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelCols; c++) {
        const singlePanelGroup = new THREE.Group();
        const posX = (c - (panelCols - 1) / 2) * (panelWidth + 0.28);
        const posZ = (r - (panelRows - 1) / 2) * (panelLength + 0.82);

        const frontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.95, 12), legMat);
        frontLeg.position.set(posX, 0.48, posZ + 0.32);
        frontLeg.castShadow = true;
        solarArrayGroup.add(frontLeg);

        const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 1.55, 12), legMat);
        backLeg.position.set(posX, 0.78, posZ - 0.32);
        backLeg.castShadow = true;
        solarArrayGroup.add(backLeg);

        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.castShadow = true;
        frameMesh.receiveShadow = true;
        const panelMesh = new THREE.Mesh(panelGeo, panelMat);
        panelMesh.position.y = 0.018;
        panelMesh.castShadow = true;

        singlePanelGroup.add(frameMesh);
        singlePanelGroup.add(panelMesh);
        singlePanelGroup.position.set(posX, 0.98, posZ);
        singlePanelGroup.rotation.x = 0.48;
        singlePanelGroup.rotation.y = -0.1;
        solarArrayGroup.add(singlePanelGroup);
      }
    }

    const sunVisual = new THREE.Mesh(
      new THREE.SphereGeometry(1.45, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xfff4b0 })
    );
    sunVisual.position.set(16, 24.5, -10);
    scene.add(sunVisual);

    const sunHalo = new THREE.Mesh(
      new THREE.RingGeometry(1.7, 3.8, 48),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    sunVisual.add(sunHalo);

    const rayBeamsGroup = new THREE.Group();
    scene.add(rayBeamsGroup);
    const rayBeamGeo = new THREE.CylinderGeometry(0.12, 1.15, 26, 20, 1, true);
    for (let i = 0; i < 5; i++) {
      const beam = new THREE.Mesh(
        rayBeamGeo,
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.055,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      beam.position.set(12 - i * 1.6, 13.5, -3 + i * 1.55);
      beam.rotation.x = -0.58;
      beam.rotation.z = -0.38 + i * 0.04;
      rayBeamsGroup.add(beam);
    }

    const windStreaksGroup = new THREE.Group();
    scene.add(windStreaksGroup);
    const streakMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let s = 0; s < 16; s++) {
      const yPos = 3.8 + Math.random() * 10;
      const zPos = -8 + Math.random() * 16;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-20, yPos, zPos),
        new THREE.Vector3(-8, yPos + 0.4, zPos + 0.6),
        new THREE.Vector3(2, yPos + 0.15, zPos - 0.2),
        new THREE.Vector3(12, yPos + 0.5, zPos + 0.4),
      ]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.028, 6, false), streakMat.clone());
      tube.userData = { speed: 0.12 + Math.random() * 0.14, startX: -22, endX: 16 };
      windStreaksGroup.add(tube);
    }

    const substationGroup = new THREE.Group();
    substationGroup.position.set(0, 0, 6.4);
    worldGroup.add(substationGroup);

    const enclosure = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 1.45, 2.25),
      new THREE.MeshPhysicalMaterial({
        color: 0xf1f5f9,
        roughness: 0.28,
        metalness: 0.35,
        clearcoat: 0.35,
      })
    );
    enclosure.position.y = 0.74;
    enclosure.castShadow = true;
    enclosure.receiveShadow = true;
    substationGroup.add(enclosure);

    const ventMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.35 });
    for (let v = 0; v < 5; v++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 1.6), ventMat);
      vent.position.set(-1.5 + v * 0.28, 0.78, 0);
      substationGroup.add(vent);
    }

    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.12,
      metalness: 0.2,
      transmission: 0.25,
      thickness: 0.4,
      transparent: true,
      opacity: 0.95,
    });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.55, 32), coreMat);
    core.position.set(1.15, 1.12, 0);
    substationGroup.add(core);

    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 2.6, 48), pulseRingMat);
    pulseRing.rotation.x = -Math.PI / 2;
    pulseRing.position.y = 0.04;
    substationGroup.add(pulseRing);

    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particlesFromWind = [];
    const particlesFromSolar = [];

    for (let p = 0; p < particleCount; p++) {
      const isWind = p % 2 === 0;
      const progress = Math.random();
      if (isWind) {
        particlePositions[p * 3] = -6.5 + progress * 6.5;
        particlePositions[p * 3 + 1] = 12 - progress * 11.3;
        particlePositions[p * 3 + 2] = -2 + progress * 8.5;
        particlesFromWind.push({ index: p, progress, speed: 0.006 + Math.random() * 0.005 });
        particleColors[p * 3] = 0.15;
        particleColors[p * 3 + 1] = 0.68;
        particleColors[p * 3 + 2] = 0.96;
      } else {
        particlePositions[p * 3] = 7.5 - progress * 7.5;
        particlePositions[p * 3 + 1] = 1.2 - progress * 0.5;
        particlePositions[p * 3 + 2] = 1.5 + progress * 5.0;
        particlesFromSolar.push({ index: p, progress, speed: 0.006 + Math.random() * 0.005 });
        particleColors[p * 3] = 0.98;
        particleColors[p * 3 + 1] = 0.72;
        particleColors[p * 3 + 2] = 0.18;
      }
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const spriteTex = makeSoftParticleTexture();
    const energyParticleSystem = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.28,
        map: spriteTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    worldGroup.add(energyParticleSystem);

    let targetRotationY = 0;
    let targetRotationX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (dragging) {
        targetRotationY += (e.clientX - lastX) * 0.0045;
        targetRotationX += (e.clientY - lastY) * 0.0028;
        targetRotationX = Math.max(-0.18, Math.min(0.12, targetRotationX));
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY += (x * 0.22 - targetRotationY) * 0.12;
      targetRotationX += (-y * 0.08 - targetRotationX) * 0.12;
    };

    const handlePointerDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture?.(e.pointerId);
    };
    const handlePointerUp = () => {
      dragging = false;
    };

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    let animationFrameId;
    let lastTelemetry = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const mode = modeRef.current;
      const motionScale = reducedMotion ? 0.25 : 1;

      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.07;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.07;
      sunHalo.lookAt(camera.position);

      const isWindActive = mode === 'wind' || mode === 'hybrid';
      const isSolarActive = mode === 'solar' || mode === 'hybrid';
      const windSpeedMultiplier = (mode === 'wind' ? 2.1 : mode === 'hybrid' ? 1 : 0.22) * motionScale;

      turbineRotorGroups.forEach((item) => {
        item.group.rotation.z -= item.baseSpeed * windSpeedMultiplier;
      });

      windStreaksGroup.visible = isWindActive && !reducedMotion;
      if (isWindActive) {
        windStreaksGroup.children.forEach((line) => {
          line.position.x += line.userData.speed * (mode === 'wind' ? 1.5 : 1);
          if (line.position.x > line.userData.endX) line.position.x = line.userData.startX;
        });
      }

      rayBeamsGroup.visible = isSolarActive && !reducedMotion;
      if (isSolarActive) {
        rayBeamsGroup.children.forEach((beam, idx) => {
          beam.material.opacity = 0.05 + Math.sin(elapsedTime * 2 + idx) * 0.03;
          if (mode === 'solar') beam.material.opacity *= 1.55;
        });
        panelMat.emissive.setHex(mode === 'solar' ? 0xd97706 : 0x0284c7);
        panelMat.emissiveIntensity = mode === 'solar' ? 0.32 + Math.sin(elapsedTime * 2.2) * 0.12 : 0.14;
      } else {
        panelMat.emissive.setHex(0x0369a1);
        panelMat.emissiveIntensity = 0.06;
      }

      const ringPhase = elapsedTime % 2.3;
      pulseRing.scale.set(1 + ringPhase * 1.25, 1 + ringPhase * 1.25, 1);
      pulseRingMat.opacity = Math.max(0, 0.42 - ringPhase * 0.18);

      if (mode === 'wind') {
        coreMat.color.setHex(0x059669);
        coreMat.emissive.setHex(0x059669);
      } else if (mode === 'solar') {
        coreMat.color.setHex(0xd97706);
        coreMat.emissive.setHex(0xd97706);
      } else {
        coreMat.color.setHex(0x0284c7);
        coreMat.emissive.setHex(0x0284c7);
      }
      coreMat.emissiveIntensity = 0.7 + Math.sin(elapsedTime * 2.4) * 0.18;

      const positions = particleGeo.attributes.position.array;
      particlesFromWind.forEach((p) => {
        if (!isWindActive) return;
        p.progress += p.speed * (mode === 'wind' ? 1.45 : 1) * motionScale;
        if (p.progress > 1) p.progress = 0;
        positions[p.index * 3] = -6.5 + p.progress * 6.5;
        positions[p.index * 3 + 1] = 12 - p.progress * 11.3 + Math.sin(elapsedTime * 3 + p.index) * 0.08;
        positions[p.index * 3 + 2] = -2 + p.progress * 8.5;
      });
      particlesFromSolar.forEach((p) => {
        if (!isSolarActive) return;
        p.progress += p.speed * (mode === 'solar' ? 1.45 : 1) * motionScale;
        if (p.progress > 1) p.progress = 0;
        positions[p.index * 3] = 7.5 - p.progress * 7.5;
        positions[p.index * 3 + 1] = 1.2 - p.progress * 0.5 + Math.sin(elapsedTime * 3 + p.index) * 0.08;
        positions[p.index * 3 + 2] = 1.5 + p.progress * 5.0;
      });
      particleGeo.attributes.position.needsUpdate = true;

      if (elapsedTime - lastTelemetry > 1.1) {
        lastTelemetry = elapsedTime;
        if (mode === 'wind') {
          setTelemetry({
            rotorSpeed: `${(24.4 + Math.sin(elapsedTime) * 1.5).toFixed(1)} RPM`,
            irradiance: '140 W/m²',
            gridOutput: `${(76.2 + Math.cos(elapsedTime) * 2.8).toFixed(1)} MW`,
            gridFreq: '60.02 Hz',
          });
        } else if (mode === 'solar') {
          setTelemetry({
            rotorSpeed: '3.8 RPM (Idle)',
            irradiance: `${Math.round(960 + Math.sin(elapsedTime) * 15)} W/m²`,
            gridOutput: `${(86.5 + Math.sin(elapsedTime) * 2.1).toFixed(1)} MW`,
            gridFreq: '59.99 Hz',
          });
        } else {
          setTelemetry({
            rotorSpeed: `${(18.2 + Math.sin(elapsedTime) * 0.6).toFixed(1)} RPM`,
            irradiance: `${Math.round(925 + Math.sin(elapsedTime) * 10)} W/m²`,
            gridOutput: `${(94.1 + Math.sin(elapsedTime) * 2.0).toFixed(1)} MW`,
            gridFreq: '60.01 Hz',
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('resize', resize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      bladeGeo.dispose();
      solarMap.dispose();
      groundTex.dispose();
      spriteTex.dispose();
    };
  }, []);

  const handleModeSelect = (mode) => {
    setActiveMode(mode);
    modeRef.current = mode;
    if (onModeChange) onModeChange(mode);
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-[28px] overflow-hidden border border-sky-200/80 bg-gradient-to-b from-[#f7fbff] via-[#e8f4fe] to-[#d7e9fb] shadow-[0_18px_50px_-18px_rgba(37,99,235,0.28)]">
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55),transparent_42%)] pointer-events-none" />

      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 backdrop-blur-xl border border-sky-200/80 shadow-sm">
          <button
            type="button"
            aria-pressed={activeMode === 'hybrid'}
            onClick={() => handleModeSelect('hybrid')}
            className={`flex items-center gap-1.5 min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200 ${
              activeMode === 'hybrid'
                ? 'bg-gradient-to-r from-sky-600 to-emerald-500 text-white shadow-glow-sky'
                : 'text-slate-600 hover:text-sky-800 hover:bg-sky-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hybrid Co-Gen</span>
          </button>
          <button
            type="button"
            aria-pressed={activeMode === 'wind'}
            onClick={() => handleModeSelect('wind')}
            className={`flex items-center gap-1.5 min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200 ${
              activeMode === 'wind'
                ? 'bg-emerald-600 text-white shadow-glow-emerald'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Priority</span>
          </button>
          <button
            type="button"
            aria-pressed={activeMode === 'solar'}
            onClick={() => handleModeSelect('solar')}
            className={`flex items-center gap-1.5 min-h-10 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200 ${
              activeMode === 'solar'
                ? 'bg-amber-500 text-white shadow-glow-solar'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar Peak</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-xl border border-sky-200/80 text-xs font-mono text-sky-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wide">3D Digital Twin Synchronized</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10">
        <div className="p-4 rounded-2xl bg-white/93 backdrop-blur-xl border border-sky-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
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
            <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Wind className="w-3 h-3 text-sky-600" />
                <span>Turbine Velocity</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5 tabular-nums">{telemetry.rotorSpeed}</div>
              <div className="text-[10px] text-sky-700 font-mono mt-0.5">
                {activeMode === 'wind' ? 'High Velocity Mode' : 'Continuous Yaw'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Sun className="w-3 h-3 text-amber-600" />
                <span>Solar Irradiance</span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-0.5 tabular-nums">{telemetry.irradiance}</div>
              <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                {activeMode === 'solar' ? 'Peak Noon Insolation' : 'Standard STC Direct'}
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-sky-100 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              Grid Injection
            </span>
            <span className="text-sky-700 font-bold tabular-nums">
              {telemetry.gridOutput} • {telemetry.gridFreq}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-[4.75rem] right-4 hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-sky-200 text-[10px] font-mono text-slate-600 pointer-events-none shadow-sm">
        <RotateCw className="w-3 h-3 text-sky-600 animate-spin-slow" />
        <span>Drag to orbit digital twin</span>
      </div>
    </div>
  );
}
